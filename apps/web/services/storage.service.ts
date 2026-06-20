import { api } from '@/lib/api'
import { endpoints } from '@/lib/endpoints'
import type {
  PresignUploadRequest,
  PresignUploadResponse,
  ConfirmUploadRequest,
  ConfirmUploadResponse,
  DeleteUploadResponse,
  DigitalAccessResponse,
  DigitalDeliveryFile,
  UploadScope,
} from '@creonex/types'

/**
 * Storage client. All S3 logic lives in the API (the `uploads` module) — this just
 * calls those routes via `lib/api`. The only non-`lib/api` network call is the raw
 * PUT of file bytes to the presigned S3 URL the API returns (direct browser → S3).
 */
export const storageService = {
  presign: (body: PresignUploadRequest) =>
    api.post<PresignUploadResponse>(endpoints.uploads.presign, body),

  confirm: (body: ConfirmUploadRequest) =>
    api.post<ConfirmUploadResponse>(endpoints.uploads.confirm, body),

  deleteObject: (key: string) =>
    api.post<DeleteUploadResponse>(endpoints.uploads.delete, { key }),

  getDigitalAccess: (bookingId: string) =>
    api.get<DigitalAccessResponse>(endpoints.uploads.digitalAccess(bookingId)),

  /**
   * Upload a digital-product file. Returns the stored file descriptor for the
   * offering's `deliveryFiles`. Presigns → PUTs bytes directly to S3 → confirms.
   */
  async uploadDigitalFile(file: File, offeringId?: string): Promise<DigitalDeliveryFile> {
    const presign = await storageService.presign({
      scope: 'digital_asset',
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      offeringId,
    })

    await fetch(presign.uploadUrl, {
      method: presign.method,
      headers: presign.headers,
      body: file,
    })

    await storageService.confirm({ key: presign.key, offeringId })

    return {
      key: presign.key,
      name: file.name,
      sizeBytes: file.size,
      contentType: file.type || undefined,
    }
  },

  /**
   * Upload a public image (profile photo or banner). Presigns → PUTs → confirms.
   * Returns the CDN URL to persist on the creator profile.
   */
  async uploadPublicFile(file: File, scope: Extract<UploadScope, 'profile' | 'banner'>): Promise<string> {
    const presign = await storageService.presign({
      scope,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
    })

    await fetch(presign.uploadUrl, {
      method: presign.method,
      headers: presign.headers,
      body: file,
    })

    const confirmed = await storageService.confirm({ key: presign.key })

    return confirmed.url
  },
}
