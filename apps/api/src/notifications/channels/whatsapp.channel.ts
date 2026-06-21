const WATI_BASE = process.env.WATI_ACCOUNT_SID
  ? `https://live-mt-server.wati.io/${process.env.WATI_ACCOUNT_SID}/api/v2`
  : null

/** Strip non-digits to produce E.164 without '+' (e.g. "919876543210"). */
function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
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

/**
 * Send a pre-approved WATI template message.
 * Silently no-ops when WATI_ACCOUNT_SID / WATI_API_KEY are absent (dev / email-only mode).
 */
export async function sendWhatsApp(
  phone: string,
  templateName: string,
  params: Array<{ name: string; value: string }>,
): Promise<void> {
  if (!WATI_BASE || !process.env.WATI_API_KEY) return

  const normalized = normalizePhone(phone)
  if (!normalized) return

  await withRetry(async () => {
    const res = await fetch(
      `${WATI_BASE}/sendTemplateMessage?whatsappNumber=${normalized}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WATI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_name: templateName,
          broadcast_name: templateName,
          parameters: params,
        }),
      },
    )

    if (!res.ok) {
      throw new Error(`WATI ${templateName} → ${res.status} ${await res.text()}`)
    }
  })
}

// ── Template helpers ──────────────────────────────────────────────────────────
// Template names must exactly match what's registered and approved in the
// WATI dashboard. Parameters must match the order of {{1}}, {{2}}... in each
// approved template body.

export const watiTemplates = {
  bookingConfirmedLearner: (
    phone: string,
    learnerName: string,
    offeringTitle: string,
    sessionDate: string,
    meetingUrl: string | null,
  ) =>
    sendWhatsApp(phone, 'booking_confirmed', [
      { name: 'learner_name',   value: learnerName },
      { name: 'offering_title', value: offeringTitle },
      { name: 'session_date',   value: sessionDate || 'Digital purchase — no session time' },
      { name: 'meeting_link',   value: meetingUrl ?? 'N/A' },
    ]),

  newBookingCreator: (
    phone: string,
    creatorName: string,
    learnerName: string,
    offeringTitle: string,
    sessionDate: string,
  ) =>
    sendWhatsApp(phone, 'new_booking', [
      { name: 'creator_name',   value: creatorName },
      { name: 'learner_name',   value: learnerName },
      { name: 'offering_title', value: offeringTitle },
      { name: 'session_date',   value: sessionDate || 'Digital purchase' },
    ]),

  bookingCancelledLearner: (phone: string, learnerName: string, offeringTitle: string) =>
    sendWhatsApp(phone, 'booking_cancelled', [
      { name: 'learner_name',   value: learnerName },
      { name: 'offering_title', value: offeringTitle },
    ]),

  classCancelledLearner: (
    phone: string,
    learnerName: string,
    offeringTitle: string,
    creatorName: string,
  ) =>
    sendWhatsApp(phone, 'class_cancelled', [
      { name: 'learner_name',   value: learnerName },
      { name: 'offering_title', value: offeringTitle },
      { name: 'creator_name',   value: creatorName },
    ]),

  digitalDelivery: (phone: string, learnerName: string, offeringTitle: string, libraryUrl: string) =>
    sendWhatsApp(phone, 'digital_delivery', [
      { name: 'learner_name',   value: learnerName },
      { name: 'offering_title', value: offeringTitle },
      { name: 'library_link',   value: libraryUrl },
    ]),
}
