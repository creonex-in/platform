import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
  const raw = process.env['CALENDAR_TOKEN_ENC_KEY'] ?? ''
  if (!raw) throw new Error('CALENDAR_TOKEN_ENC_KEY env var not set')
  // Accept 64-char hex (32 bytes) or raw 32-char key
  if (raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)) return Buffer.from(raw, 'hex')
  const buf = Buffer.from(raw, 'utf8')
  if (buf.length !== 32) throw new Error('CALENDAR_TOKEN_ENC_KEY must be 32 bytes (64-char hex)')
  return buf
}

export function encryptToken(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // Format: base64(iv[12] + tag[16] + ciphertext)
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decryptToken(encoded: string): string {
  const key = getKey()
  const buf = Buffer.from(encoded, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const ciphertext = buf.subarray(28)
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  return decipher.update(ciphertext) + decipher.final('utf8')
}
