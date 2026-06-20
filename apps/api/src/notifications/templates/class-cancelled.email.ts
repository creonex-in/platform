interface ClassCancelledLearnerContext {
  learnerName: string
  offeringTitle: string
  creatorName: string
  sessionDate: string
  hadPayment: boolean
  bookingId: string
}

export function classCancelledLearnerHtml(ctx: ClassCancelledLearnerContext): string {
  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:560px;margin:auto;padding:24px">
  <h2 style="color:#dc2626">Class cancelled</h2>
  <p>Hi ${ctx.learnerName},</p>
  <p>We're sorry — <strong>${ctx.creatorName}</strong> has cancelled the class <strong>${ctx.offeringTitle}</strong>${ctx.sessionDate ? ` scheduled for ${ctx.sessionDate}` : ''}.</p>
  ${ctx.hadPayment ? '<p><strong>Refund:</strong> A full refund has been initiated and will reflect within 5–7 business days.</p>' : ''}
  <p style="color:#666;font-size:13px">Booking ID: ${ctx.bookingId}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="color:#888;font-size:12px">Creonex — India's creator learning platform</p>
</body></html>`
}

interface ClassCancelledCreatorSummaryContext {
  creatorName: string
  offeringTitle: string
  cancelledCount: number
}

export function classCancelledCreatorSummaryHtml(ctx: ClassCancelledCreatorSummaryContext): string {
  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:560px;margin:auto;padding:24px">
  <h2 style="color:#dc2626">Class cancellation processed</h2>
  <p>Hi ${ctx.creatorName},</p>
  <p>Your class <strong>${ctx.offeringTitle}</strong> has been cancelled. ${ctx.cancelledCount} learner${ctx.cancelledCount !== 1 ? 's have' : ' has'} been notified and refunds are being processed.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="color:#888;font-size:12px">Creonex — India's creator learning platform</p>
</body></html>`
}
