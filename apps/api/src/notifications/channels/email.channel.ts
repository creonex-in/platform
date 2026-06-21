import { Logger } from '@nestjs/common'
import { Resend } from 'resend'

const logger = new Logger('EmailChannel')
let _resend: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  return (_resend ??= new Resend(process.env.RESEND_API_KEY))
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 2000): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (attempts <= 1) throw err
    await new Promise((r) => setTimeout(r, delayMs))
    return withRetry(fn, attempts - 1, delayMs)
  }
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const client = getResend()
  if (!client) {
    logger.warn('RESEND_API_KEY not set — email notification skipped')
    return
  }
  await withRetry(() =>
    client.emails.send({
      from: process.env.EMAIL_FROM ?? 'Creonex <noreply@creonex.in>',
      to,
      subject,
      html,
    }),
  )
}
