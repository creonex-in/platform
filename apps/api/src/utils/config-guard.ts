import { Logger } from '@nestjs/common'

const REQUIRED = ['DATABASE_URL', 'BETTER_AUTH_SECRET']

const OPTIONAL = [
  'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN',
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_PUBLIC_BUCKET', 'S3_PRIVATE_BUCKET',
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
  'WATI_ACCOUNT_SID', 'WATI_API_KEY',
]

export function validateConfig(): void {
  const logger = new Logger('ConfigGuard')

  const missing = REQUIRED.filter((k) => !process.env[k])
  if (missing.length) {
    logger.error(`Missing required env vars: ${missing.join(', ')} — server cannot start`)
    process.exit(1)
  }

  const absent = OPTIONAL.filter((k) => !process.env[k])
  if (absent.length) {
    logger.warn(`Optional env vars not set (features disabled): ${absent.join(', ')}`)
  }
}
