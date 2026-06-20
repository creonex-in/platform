import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PayoutsRepository } from './payouts.repository'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { UsersRepository } from '../users/users.repository'
import { PaymentService } from '../payment/payment.service'
import type {
  CreatorEarnings, KycStatusResponse, LedgerEntryItem, PayoutItem, PayoutEntityType,
} from '@creonex/types'
import type { SubmitKycDto } from './payouts.dto'

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name)

  constructor(
    private readonly payoutsRepo: PayoutsRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
    private readonly usersRepo: UsersRepository,
    private readonly paymentService: PaymentService,
  ) {}

  private async resolveProfileId(userId: string): Promise<string> {
    const profile = await this.creatorProfileRepo.findByUserId(userId)
    if (!profile) throw new NotFoundException('Creator profile not found')
    return profile.id
  }

  private maskAccount(acct: string): string {
    return acct.length <= 4 ? acct : `••••${acct.slice(-4)}`
  }

  /**
   * Submit KYC + bank → persist (PII), then create the Razorpay Route linked account.
   * Status goes `pending`; a webhook flips it to `verified` + enables payouts later.
   * If linked-account creation fails (e.g. Route not configured), the KYC is still
   * saved as pending so it can be retried — we never falsely report verified.
   */
  async submitKyc(userId: string, email: string, dto: SubmitKycDto): Promise<KycStatusResponse> {
    const profileId = await this.resolveProfileId(userId)

    // Phone is identity data — single source of truth on the user record.
    await this.usersRepo.updatePhone(userId, dto.phone)

    // ── Razorpay Route onboarding (3 steps; each failure is non-fatal) ───────────
    let razorpayAccountId: string | undefined
    let razorpayProductId: string | undefined

    try {
      razorpayAccountId = await this.paymentService.createLinkedAccount({
        email,
        phone: dto.phone,
        legalName: dto.legalName,
        entityType: dto.entityType,
        pan: dto.pan,
        bankAccountNumber: dto.bankAccountNumber,
        bankIfsc: dto.bankIfsc,
        accountHolderName: dto.accountHolderName,
      })
    } catch (err) {
      this.logger.warn(`Linked-account creation deferred for ${profileId}: ${String(err)}`)
    }

    if (razorpayAccountId) {
      try {
        await this.paymentService.createStakeholder(razorpayAccountId, {
          email,
          phone: dto.phone,
          legalName: dto.legalName,
          entityType: dto.entityType,
          pan: dto.pan,
          bankAccountNumber: dto.bankAccountNumber,
          bankIfsc: dto.bankIfsc,
          accountHolderName: dto.accountHolderName,
        })
        razorpayProductId = await this.paymentService.requestSettlementsProduct(razorpayAccountId, {
          bankAccountNumber: dto.bankAccountNumber,
          bankIfsc: dto.bankIfsc,
          accountHolderName: dto.accountHolderName,
        })
      } catch (err) {
        this.logger.warn(`Stakeholder/product config deferred for ${profileId}: ${String(err)}`)
      }
    }

    // Persist KYC data + Razorpay product ID (always, even if Razorpay partially failed)
    await this.payoutsRepo.upsertAccount(profileId, {
      legalName: dto.legalName,
      entityType: dto.entityType,
      pan: dto.pan,
      bankAccountNumber: dto.bankAccountNumber,
      bankIfsc: dto.bankIfsc,
      accountHolderName: dto.accountHolderName,
      razorpayProductId,
    })

    await this.creatorProfileRepo.updatePayoutFields(profileId, {
      ...(razorpayAccountId ? { razorpayAccountId } : {}),
      kycStatus: 'pending',
    })

    return this.getKycStatus(userId)
  }

  async getKycStatus(userId: string): Promise<KycStatusResponse> {
    const profile = await this.creatorProfileRepo.findByUserId(userId)
    if (!profile) throw new NotFoundException('Creator profile not found')
    const account = await this.payoutsRepo.getAccount(profile.id)
    return {
      status: profile.kycStatus,
      payoutsEnabled: profile.payoutsEnabled,
      account: account
        ? {
            legalName: account.legalName,
            entityType: account.entityType as PayoutEntityType,
            maskedAccount: this.maskAccount(account.bankAccountNumber),
            bankIfsc: account.bankIfsc,
            accountHolderName: account.accountHolderName,
          }
        : null,
    }
  }

  async getEarnings(userId: string): Promise<CreatorEarnings> {
    const profileId = await this.resolveProfileId(userId)
    const byStatus = await this.payoutsRepo.earningsByStatus(profileId)
    const lifetime = await this.payoutsRepo.lifetimeTotals(profileId)
    return {
      availablePaise: byStatus['settled'] ?? 0,
      heldPaise: byStatus['held'] ?? 0,
      pendingPaise: byStatus['pending'] ?? 0,
      lifetimeGrossPaise: lifetime.gross,
      lifetimeNetPaise: lifetime.net,
    }
  }

  async getLedger(userId: string): Promise<LedgerEntryItem[]> {
    const profileId = await this.resolveProfileId(userId)
    const rows = await this.payoutsRepo.listLedger(profileId)
    return rows.map((r) => ({
      id: r.id,
      bookingId: r.bookingId,
      offeringTitle: r.offeringTitle,
      grossPaise: r.grossPaise,
      platformFeePaise: r.platformFeePaise,
      netPaise: r.netPaise,
      status: r.status as LedgerEntryItem['status'],
      createdAt: r.createdAt.toISOString(),
    }))
  }

  async getPayouts(userId: string): Promise<PayoutItem[]> {
    const profileId = await this.resolveProfileId(userId)
    const rows = await this.payoutsRepo.listPayouts(profileId)
    return rows.map((r) => ({
      id: r.id,
      amountPaise: r.amountPaise,
      status: r.status as PayoutItem['status'],
      utr: r.utr,
      createdAt: r.createdAt.toISOString(),
    }))
  }

  // ── Webhook-driven account state (Razorpay account.* events) ──────────────────

  /**
   * Linked account activated → mark verified, enable payouts, and transfer the
   * earnings that accrued (as `pending`) while the creator was unverified, then
   * release any held rows. Idempotent: re-running only transfers still-pending rows.
   */
  async activateAccount(razorpayAccountId: string): Promise<void> {
    const creator = await this.creatorProfileRepo.findByRazorpayAccountId(razorpayAccountId)
    if (!creator) {
      this.logger.warn(`activateAccount: no creator for ${razorpayAccountId}`)
      return
    }
    await this.creatorProfileRepo.updatePayoutFields(creator.id, {
      kycStatus: 'verified',
      payoutsEnabled: true,
    })

    const pending = await this.payoutsRepo.findPendingWithPayment(creator.id)
    for (const row of pending) {
      if (!row.razorpayPaymentId) continue
      try {
        const transfer = await this.paymentService.createTransfer(
          row.razorpayPaymentId,
          razorpayAccountId,
          row.netPaise,
          { onHold: false },
        )
        await this.payoutsRepo.setLedgerStatusByBooking(row.bookingId, 'settled', transfer.id)
      } catch (err) {
        this.logger.warn(`Pending transfer failed for booking ${row.bookingId}: ${String(err)}`)
      }
    }

    await this.payoutsRepo.releaseHeld(creator.id)
  }

  /** Linked account rejected / suspended → disable payouts, set KYC status. */
  async deactivateAccount(razorpayAccountId: string, status: 'failed' | 'pending'): Promise<void> {
    const creator = await this.creatorProfileRepo.findByRazorpayAccountId(razorpayAccountId)
    if (!creator) return
    await this.creatorProfileRepo.updatePayoutFields(creator.id, {
      kycStatus: status,
      payoutsEnabled: false,
    })
  }
}
