import { Logger } from '@nestjs/common'
import { Resend } from 'resend'

const logger = new Logger('EmailChannel')
let _resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  return (_resend ??= new Resend(process.env.RESEND_API_KEY))
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const client = getResend()
  if (!client) {
    logger.warn('RESEND_API_KEY not set — email notification skipped')
    return
  }
  await client.emails.send({
    from: process.env.EMAIL_FROM ?? 'Creonex <noreply@creonex.in>',
    to,
    subject,
    html,
  })
}
