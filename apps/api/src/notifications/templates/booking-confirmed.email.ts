interface BookingConfirmedContext {
  learnerName: string
  offeringTitle: string
  creatorName: string
  sessionDate: string   // pre-formatted by caller
  meetingUrl: string | null
  bookingId: string
}

export function bookingConfirmedLearnerHtml(ctx: BookingConfirmedContext): string {
  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:560px;margin:auto;padding:24px">
  <h2 style="color:#7c3aed">Your booking is confirmed! 🎉</h2>
  <p>Hi ${ctx.learnerName},</p>
  <p>Your session <strong>${ctx.offeringTitle}</strong> with <strong>${ctx.creatorName}</strong> is booked.</p>
  ${ctx.sessionDate ? `<p><strong>When:</strong> ${ctx.sessionDate}</p>` : ''}
  ${ctx.meetingUrl ? `<p><strong>Join:</strong> <a href="${ctx.meetingUrl}">${ctx.meetingUrl}</a></p>` : ''}
  <p style="color:#666;font-size:13px">Booking ID: ${ctx.bookingId}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="color:#888;font-size:12px">Creonex — India's creator learning platform</p>
</body></html>`
}

interface NewBookingAlertContext {
  creatorName: string
  learnerName: string
  offeringTitle: string
  sessionDate: string
  bookingId: string
}

export function newBookingAlertHtml(ctx: NewBookingAlertContext): string {
  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:560px;margin:auto;padding:24px">
  <h2 style="color:#7c3aed">New booking received</h2>
  <p>Hi ${ctx.creatorName},</p>
  <p><strong>${ctx.learnerName}</strong> just booked your session <strong>${ctx.offeringTitle}</strong>.</p>
  ${ctx.sessionDate ? `<p><strong>When:</strong> ${ctx.sessionDate}</p>` : ''}
  <p style="color:#666;font-size:13px">Booking ID: ${ctx.bookingId}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="color:#888;font-size:12px">Creonex — India's creator learning platform</p>
</body></html>`
}
