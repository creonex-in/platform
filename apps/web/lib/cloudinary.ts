const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const MIN_DIMENSION = 200

export interface CloudinaryUploadResult {
  url: string
  deleteToken: string
}

export async function validateBannerFile(file: File): Promise<string | null> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, or WebP images are allowed'
  }
  if (file.size > 10 * 1024 * 1024) {
    return 'Banner must be smaller than 10 MB'
  }
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      if (img.width < 800) {
        resolve('Banner must be at least 800 px wide')
      } else {
        resolve(null)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve('Could not read image — file may be corrupt')
    }
    img.src = objectUrl
  })
}

export async function validateImageFile(file: File): Promise<string | null> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, or WebP images are allowed'
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'Image must be smaller than 5 MB'
  }
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      if (img.width < MIN_DIMENSION || img.height < MIN_DIMENSION) {
        resolve(`Image must be at least ${MIN_DIMENSION}×${MIN_DIMENSION} px`)
      } else {
        resolve(null)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve('Could not read image — file may be corrupt')
    }
    img.src = objectUrl
  })
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', preset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: { message?: string } }
    throw new Error(body.error?.message ?? 'Upload failed')
  }
  const data = await res.json() as { secure_url: string; delete_token: string }
  return { url: data.secure_url, deleteToken: data.delete_token }
}

export async function tryDeleteCloudinaryUpload(deleteToken: string): Promise<void> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!
  try {
    await fetch(`https://api.cloudinary.com/v1_1/${cloud}/delete_by_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: deleteToken }),
    })
  } catch {
    // best-effort only
  }
}
