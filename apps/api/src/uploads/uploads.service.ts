import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type {
  ConfirmUploadResponse,
  DeleteUploadResponse,
  DigitalAccessResponse,
  DigitalAssetLink,
  DigitalDeliveryFile,
  PresignUploadResponse,
  UploadScope,
} from '@creonex/types'
import { BookingsService } from '../bookings/bookings.service'
import { OfferingsService } from '../offerings/offerings.service'
import { generateId } from '../utils/id'
import { withBreaker } from '../utils/circuit-breaker'
import type { PresignUploadDto } from './uploads.dto'

const REGION = process.env.AWS_REGION ?? 'ap-south-1'
const PUBLIC_BUCKET = process.env.S3_PUBLIC_BUCKET ?? 'creonex-public-stub'
const PRIVATE_BUCKET = process.env.S3_PRIVATE_BUCKET ?? 'creonex-private-stub'
const CDN_HOST = process.env.CDN_PUBLIC_HOST ?? 'cdn.stub.invalid'
const PRESIGN_EXPIRY = Number(process.env.PRESIGN_EXPIRY_SECONDS ?? 900)

const PUBLIC_SCOPES: ReadonlySet<UploadScope> = new Set<UploadScope>(['profile', 'banner'])

@Injectable()
export class UploadsService {
  private _s3: S3Client | null = null
  private get s3(): S3Client {
    return (this._s3 ??= new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    }))
  }

  constructor(
    private readonly bookingsService: BookingsService,
    private readonly offeringsService: OfferingsService,
  ) {}

  /** Object key prefix per scope. Digital files land in `pending/` so an S3 lifecycle
   *  rule can sweep them if the offering is never saved. */
  private keyFor(scope: UploadScope, userId: string, fileName: string): string {
    const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const id = generateId()
    switch (scope) {
      case 'profile':       return `profiles/${userId}/${id}-${safe}`
      case 'banner':        return `banners/${userId}/${id}-${safe}`
      case 'digital_asset': return `uploads/pending/${userId}/${id}-${safe}`
    }
  }

  private cdnUrl(key: string): string {
    return `https://${CDN_HOST}/${key}`
  }

  /** Infer which bucket owns a key from its prefix. */
  private bucketForKey(key: string): string {
    return key.startsWith('profiles/') || key.startsWith('banners/')
      ? PUBLIC_BUCKET
      : PRIVATE_BUCKET
  }

  async presign(userId: string, dto: PresignUploadDto): Promise<PresignUploadResponse> {
    if (dto.scope === 'digital_asset' && !dto.offeringId) {
      throw new BadRequestException('offeringId is required for digital_asset uploads')
    }
    if (dto.scope === 'digital_asset' && dto.offeringId) {
      await this.offeringsService.verifyOwnership(dto.offeringId, userId)
    }
    const isPublic = PUBLIC_SCOPES.has(dto.scope)
    const bucket = isPublic ? PUBLIC_BUCKET : PRIVATE_BUCKET
    const key = this.keyFor(dto.scope, userId, dto.fileName)

    const uploadUrl = await withBreaker('s3', () =>
      getSignedUrl(
        this.s3,
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: dto.contentType,
          ContentLength: dto.sizeBytes,
        }),
        { expiresIn: PRESIGN_EXPIRY },
      ),
    )

    return {
      uploadUrl,
      key,
      publicUrl: isPublic ? this.cdnUrl(key) : null,
      method: 'PUT',
      headers: { 'Content-Type': dto.contentType },
      expiresInSeconds: PRESIGN_EXPIRY,
    }
  }

  async confirm(key: string): Promise<ConfirmUploadResponse> {
    const bucket = this.bucketForKey(key)
    try {
      await withBreaker('s3', () => this.s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key })))
    } catch {
      throw new BadRequestException('Upload not found — object does not exist in S3')
    }
    const isPublic = bucket === PUBLIC_BUCKET
    return { key, url: isPublic ? this.cdnUrl(key) : key }
  }

  async delete(key: string): Promise<DeleteUploadResponse> {
    const bucket = this.bucketForKey(key)
    await withBreaker('s3', () => this.s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })))
    return { key, deleted: true }
  }

  async digitalAccess(bookingId: string, learnerId: string): Promise<DigitalAccessResponse> {
    const booking = await this.bookingsService.findByIdForLearner(bookingId, learnerId)
    if (!booking) throw new NotFoundException('Booking not found')
    if (!['confirmed', 'completed'].includes(booking.status)) {
      throw new ForbiddenException('Purchase not confirmed')
    }

    const offering = await this.offeringsService.findById(booking.offeringId)
    if (!offering) throw new NotFoundException('Offering not found')

    const storedFiles = (offering.metadata?.files ?? []) as DigitalDeliveryFile[]
    const files: DigitalAssetLink[] = await Promise.all(
      storedFiles.map(async (f) => ({
        name: f.name,
        sizeBytes: f.sizeBytes,
        url: await withBreaker('s3', () =>
          getSignedUrl(
            this.s3,
            new GetObjectCommand({ Bucket: PRIVATE_BUCKET, Key: f.key }),
            { expiresIn: PRESIGN_EXPIRY },
          ),
        ),
      })),
    )

    return {
      offeringId: offering.id,
      files,
      externalUrl: offering.metadata?.externalUrl ?? null,
      instructions: offering.metadata?.instructions ?? null,
      expiresInSeconds: PRESIGN_EXPIRY,
    }
  }
}
