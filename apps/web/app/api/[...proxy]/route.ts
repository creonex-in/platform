// This BFF proxy is no longer needed.
// All API calls use cookie-based auth (better-auth.session_token) via next.config.ts rewrites.
export const dynamic = 'force-dynamic'
export async function GET() {
  return new Response('Not found', { status: 404 })
}
