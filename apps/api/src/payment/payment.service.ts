import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Razorpay from 'razorpay'
import { createHmac } from 'node:crypto'
import { withBreaker } from '../utils/circuit-breaker'

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

export interface CreateLinkedAccountInput {
  email: string
  phone?: string
  legalName: string
  entityType: string
  pan: string
  bankAccountNumber: string
  bankIfsc: string
  accountHolderName: string
}

export interface RazorpayTransfer {
  id: string
  amount: number
  recipientAccountId: string
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
      const order = await withBreaker('razorpay', () =>
        this.rzp.orders.create({ amount: amountPaise, currency: 'INR', receipt }),
      )
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
      const refund = await withBreaker('razorpay', () =>
        this.rzp.payments.refund(paymentId, { amount: amountPaise, speed: 'normal' }),
      )
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

  // ── Razorpay Route: linked accounts + transfers ───────────────────────────────
  // Route must be enabled on the platform Razorpay account for these to succeed.

  /**
   * Create a Route linked (sub-merchant) account for a creator. Returns the linked
   * account id to persist on the creator profile. Must be followed by
   * createStakeholder + requestSettlementsProduct to complete onboarding.
   */
  async createLinkedAccount(input: CreateLinkedAccountInput): Promise<string> {
    try {
      const account = await this.rzp.accounts.create({
        email: input.email,
        phone: input.phone ?? '',
        type: 'route',
        legal_business_name: input.legalName,
        customer_facing_business_name: input.legalName,
        business_type: input.entityType,
        contact_name: input.accountHolderName,
        profile: { category: 'education', subcategory: 'coaching' },
        legal_info: { pan: input.pan },
      })
      return account.id
    } catch (err) {
      throw new InternalServerErrorException(`Razorpay linked-account creation failed: ${String(err)}`)
    }
  }

  /** Create a Route stakeholder (the individual/contact) required for Razorpay KYC. */
  async createStakeholder(accountId: string, input: CreateLinkedAccountInput): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = await (this.rzp.stakeholders as any).create(accountId, {
        name: input.accountHolderName,
        phone: { primary: (input.phone ?? '').replace(/^\+91/, '') },
        kyc: { pan: input.pan },
      })
      return result.id as string
    } catch (err) {
      throw new InternalServerErrorException(`Razorpay stakeholder creation failed: ${String(err)}`)
    }
  }

  /**
   * Request the Route product configuration and attach settlement bank details.
   * Must be called after createLinkedAccount. Returns the Razorpay product ID,
   * which must be stored to allow future bank-account updates.
   */
  async requestSettlementsProduct(
    accountId: string,
    input: { bankAccountNumber: string; bankIfsc: string; accountHolderName: string },
  ): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const product = await (this.rzp.products as any).requestProductConfiguration(accountId, {
        product_name: 'route',
        tnc_accepted: true,
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await (this.rzp.products as any).edit(accountId, product.id, {
        settlements: {
          account_number: input.bankAccountNumber,
          ifsc_code: input.bankIfsc,
          beneficiary_name: input.accountHolderName,
        },
      })
      return product.id as string
    } catch (err) {
      throw new InternalServerErrorException(`Razorpay Route product configuration failed: ${String(err)}`)
    }
  }

  /**
   * Split a captured payment to a creator's linked account. `onHold` keeps the funds
   * with the platform until `onHoldUntil` (refund window / pending KYC).
   */
  async createTransfer(
    paymentId: string,
    linkedAccountId: string,
    amountPaise: number,
    opts: { onHold: boolean; onHoldUntil?: number } = { onHold: false },
  ): Promise<RazorpayTransfer> {
    try {
      const result = await withBreaker('razorpay', () =>
        this.rzp.payments.transfer(paymentId, {
          transfers: [
            {
              account: linkedAccountId,
              amount: amountPaise,
              currency: 'INR',
              on_hold: opts.onHold ? 1 : 0,
              ...(opts.onHoldUntil ? { on_hold_until: opts.onHoldUntil } : {}),
            },
          ],
        }),
      )
      const created = result.items[0]
      if (!created) throw new Error('Razorpay returned no transfer')
      return {
        id: created.id,
        amount: Number(created.amount),
        recipientAccountId: linkedAccountId,
      }
    } catch (err) {
      throw new InternalServerErrorException(`Razorpay transfer failed: ${String(err)}`)
    }
  }

  /** Reverse a transfer (claw back the creator's share) — used on refund/cancel. */
  async reverseTransfer(transferId: string, amountPaise: number): Promise<void> {
    try {
      await withBreaker('razorpay', () =>
        this.rzp.transfers.reverse(transferId, { amount: amountPaise }),
      )
    } catch (err) {
      throw new InternalServerErrorException(`Razorpay transfer reversal failed: ${String(err)}`)
    }
  }
}
