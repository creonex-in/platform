interface DigitalDeliveryContext {
  learnerName: string
  offeringTitle: string
  creatorName: string
  libraryUrl: string
  instructions: string | null
}

export function digitalDeliveryHtml(ctx: DigitalDeliveryContext): string {
  return `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#111;max-width:560px;margin:auto;padding:24px">
  <h2 style="color:#7c3aed">Your purchase is ready!</h2>
  <p>Hi ${ctx.learnerName},</p>
  <p>Thank you for purchasing <strong>${ctx.offeringTitle}</strong> by <strong>${ctx.creatorName}</strong>.</p>
  ${ctx.instructions ? `<p><strong>Instructions from the creator:</strong><br/>${ctx.instructions}</p>` : ''}
  <p><a href="${ctx.libraryUrl}" style="background:#7c3aed;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:8px">Access your purchase</a></p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
  <p style="color:#888;font-size:12px">Creonex — India's creator learning platform</p>
</body></html>`
}
