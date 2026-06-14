import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Razorpay from 'razorpay'
import { createHmac } from 'node:crypto'

export interface RazorpayOrder {
  id: string
  amount: number   // paise
  currency: string
  receipt: string
}

export interface RazorpayRefund {
  id: string
  amount: number
  paymentId: string
}

@Injectable()
export class PaymentService {
  private _rzp: Razorpay | null = null
  private readonly keyId: string
  private readonly keySecret: string
  private readonly webhookSecret: string

  constructor(private readonly config: ConfigService) {
    this.keyId = this.config.get<string>('RAZORPAY_KEY_ID', '')
    this.keySecret = this.config.get<string>('RAZORPAY_KEY_SECRET', '')
    this.webhookSecret = this.config.get<string>('RAZORPAY_WEBHOOK_SECRET', '')
  }

  private get rzp(): Razorpay {
    if (!this._rzp) {
      if (!this.keyId) throw new InternalServerErrorException('RAZORPAY_KEY_ID not configured')
      this._rzp = new Razorpay({ key_id: this.keyId, key_secret: this.keySecret })
    }
    return this._rzp
  }

  // ── Order creation ────────────────────────────────────────────────────────────

  async createOrder(amountPaise: number, receipt: string): Promise<RazorpayOrder> {
    try {
      const order = await this.rzp.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt,
      })
      return {
        id: order.id,
        amount: order.amount as number,
        currency: order.currency,
        receipt: order.receipt ?? receipt,
      }
    } catch (err) {
      throw new InternalServerErrorException(`Razorpay order creation failed: ${String(err)}`)
    }
  }

  // ── Signature verification ────────────────────────────────────────────────────

  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const expected = createHmac('sha256', this.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')
    return expected === signature
  }

  verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
    const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
    const expected = createHmac('sha256', this.webhookSecret)
      .update(body)
      .digest('hex')
    return expected === signature
  }

  // ── Refund ────────────────────────────────────────────────────────────────────

  async refund(paymentId: string, amountPaise: number): Promise<RazorpayRefund> {
    try {
      const refund = await this.rzp.payments.refund(paymentId, {
        amount: amountPaise,
        speed: 'normal',
      })
      return {
        id: refund.id,
        amount: refund.amount as number,
        paymentId: refund.payment_id,
      }
    } catch (err) {
      throw new InternalServerErrorException(`Razorpay refund failed: ${String(err)}`)
    }
  }

  getPublicKey(): string {
    return this.keyId
  }
}
