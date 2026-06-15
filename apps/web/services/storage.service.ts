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
} from '@creonex/types'

/**
 * Storage client. All S3 logic lives in the API (the `uploads` module) — this just
 * calls those routes via `lib/api`. The only non-`lib/api` network call is the raw
 * PUT of file bytes to the presigned S3 URL the API returns (direct browser → S3).
 *
 * NOTE: the API endpoints are STUBS until AWS is provisioned (see
 * docs/s3-cloudfront-setup.md). `uploadFile` currently records the file's key from
 * the presign response WITHOUT performing the real S3 PUT — wire the PUT in once the
 * presigned URLs are live. The contract below will not change.
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
   * offering's `deliveryFiles`. Today (stub) it presigns and records the key; once
   * S3 is live, insert the real `PUT presign.uploadUrl` here before returning.
   */
  async uploadDigitalFile(file: File, offeringId?: string): Promise<DigitalDeliveryFile> {
    const presign = await storageService.presign({
      scope: 'digital_asset',
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      offeringId,
    })
    // TODO(storage): real upload →
    //   await fetch(presign.uploadUrl, { method: presign.method, headers: presign.headers, body: file })
    //   await storageService.confirm({ key: presign.key, offeringId })
    return {
      key: presign.key,
      name: file.name,
      sizeBytes: file.size,
      contentType: file.type || undefined,
    }
  },
}
