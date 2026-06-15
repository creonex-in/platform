import { BadRequestException, Injectable } from '@nestjs/common'
import type {
  ConfirmUploadResponse,
  DeleteUploadResponse,
  DigitalAccessResponse,
  PresignUploadResponse,
  UploadScope,
} from '@creonex/types'
import { generateId } from '../utils/id'
import type { PresignUploadDto } from './uploads.dto'

/*
 * ⚠️ STUB SERVICE — no AWS yet.
 *
 * These methods return correctly-shaped placeholder responses so the frontend can
 * integrate the full upload + digital-delivery flow now. When S3 + CloudFront are
 * provisioned (see docs/s3-cloudfront-setup.md), swap the bodies for the AWS SDK:
 *   - presign  → S3 `createPresignedPost` / multipart presigned part URLs
 *   - confirm  → verify the object exists, persist the key on the profile/offering
 *   - delete   → `DeleteObject`
 *   - digital  → verify a confirmed booking, then sign GET URLs for the files
 * The HTTP contract (routes + request/response shapes) will NOT change.
 */

const REGION = process.env.AWS_REGION ?? 'ap-south-1'
const PUBLIC_BUCKET = process.env.S3_PUBLIC_BUCKET ?? 'creonex-public-stub'
const PRIVATE_BUCKET = process.env.S3_PRIVATE_BUCKET ?? 'creonex-private-stub'
const CDN_HOST = process.env.CDN_PUBLIC_HOST ?? 'cdn.stub.invalid'
const PRESIGN_EXPIRY = Number(process.env.PRESIGN_EXPIRY_SECONDS ?? 900)

const PUBLIC_SCOPES: ReadonlySet<UploadScope> = new Set<UploadScope>(['profile', 'banner'])

@Injectable()
export class UploadsService {
  /** Object key prefix per scope. Digital files land in a `pending/` prefix so an
   *  S3 lifecycle rule can sweep them if the offering is never saved. */
  private keyFor(scope: UploadScope, userId: string, fileName: string): string {
    const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const id = generateId()
    switch (scope) {
      case 'profile': return `profiles/${userId}/${id}-${safe}`
      case 'banner': return `banners/${userId}/${id}-${safe}`
      case 'digital_asset': return `uploads/pending/${userId}/${id}-${safe}`
    }
  }

  private cdnUrl(key: string): string {
    return `https://${CDN_HOST}/${key}`
  }

  /** STUB: returns a fake presigned PUT URL in the real shape. */
  presign(userId: string, dto: PresignUploadDto): PresignUploadResponse {
    if (dto.scope === 'digital_asset' && !dto.offeringId) {
      throw new BadRequestException('offeringId is required for digital_asset uploads')
    }
    const isPublic = PUBLIC_SCOPES.has(dto.scope)
    const bucket = isPublic ? PUBLIC_BUCKET : PRIVATE_BUCKET
    const key = this.keyFor(dto.scope, userId, dto.fileName)

    return {
      // STUB upload URL — a real presigned S3 PUT will replace this.
      uploadUrl: `https://${bucket}.s3.${REGION}.amazonaws.com/${key}?X-Amz-Stub=1`,
      key,
      publicUrl: isPublic ? this.cdnUrl(key) : null,
      method: 'PUT',
      headers: { 'Content-Type': dto.contentType },
      expiresInSeconds: PRESIGN_EXPIRY,
    }
  }

  /** STUB: echoes the key as confirmed. Real impl verifies the object + persists it. */
  confirm(key: string): ConfirmUploadResponse {
    const isPublic = key.startsWith('profiles/') || key.startsWith('banners/')
    return { key, url: isPublic ? this.cdnUrl(key) : key }
  }

  /** STUB: pretends the object was deleted. */
  delete(key: string): DeleteUploadResponse {
    return { key, deleted: true }
  }

  /** STUB: buyer-gated digital delivery. Real impl checks a confirmed booking and
   *  signs short-lived GET URLs for the offering's files. */
  digitalAccess(bookingId: string): DigitalAccessResponse {
    return {
      offeringId: `stub-for-${bookingId}`,
      files: [],
      externalUrl: null,
      instructions: null,
      expiresInSeconds: PRESIGN_EXPIRY,
    }
  }
}
