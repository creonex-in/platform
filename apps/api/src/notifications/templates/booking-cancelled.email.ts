interface BookingCancelledContext {
  recipientName: string
  offeringTitle: string
  cancelledBy: string   // 'learner' | 'creator' | 'system'
  hadPayment: boolean
  bookingId: string
}

export function bookingCancelledHtml(ctx: BookingCancelledContext): string {
  const who = ctx.cancelledBy === 'learner' ? 'you' : ctx.cancelledBy === 'creator' ? 'the creator' : 'the system'
  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:560px;margin:auto;padding:24px">
  <h2 style="color:#dc2626">Booking cancelled</h2>
  <p>Hi ${ctx.recipientName},</p>
  <p>Your booking for <strong>${ctx.offeringTitle}</strong> has been cancelled by ${who}.</p>
  ${ctx.hadPayment ? '<p>A refund has been initiated and will reflect within 5–7 business days.</p>' : ''}
  <p style="color:#666;font-size:13px">Booking ID: ${ctx.bookingId}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="color:#888;font-size:12px">Creonex — India's creator learning platform</p>
</body></html>`
}
