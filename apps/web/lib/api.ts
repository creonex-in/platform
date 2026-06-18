export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError
}

export function isUnauthorized(e: unknown): boolean {
  return isApiError(e) && e.status === 401
}

export function isNotFound(e: unknown): boolean {
  return isApiError(e) && e.status === 404
}

export function isServerError(e: unknown): boolean {
  return isApiError(e) && e.status >= 500
}

/** API unreachable — connection refused / DNS / socket reset (not an HTTP response). */
export function isNetworkError(e: unknown): boolean {
  return isApiError(e) && e.status === 0
}

// Server has no browser origin, so it calls the API by absolute URL and
// forwards the session cookie header explicitly. The browser must use a
// RELATIVE URL so the request is same-origin and goes through the Next rewrite
// proxy (next.config.ts) — that keeps the session cookie first-party to the web
// domain. A direct cross-origin browser call to the API domain would send no
// cookie (cookie lives on the web origin) and 401.
const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: Method
  body?: unknown
  cookieHeader?: string
  next?: { revalidate?: number | false; tags?: string[] }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, cookieHeader, next } = options
  const isServer = typeof window === 'undefined'
  const baseUrl = isServer ? SERVER_BASE_URL : ''

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (isServer && cookieHeader) headers['Cookie'] = cookieHeader

  const init: RequestInit = {
    method,
    headers,
    credentials: isServer ? 'omit' : 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(next ? { next } : { cache: 'no-store' }),
  }

  let res: Response
  try {
    res = await fetch(`${baseUrl}${path}`, init)
  } catch (e) {
    // Connection failed (API down / DNS / socket reset) — a raw
    // TypeError("fetch failed"), not an HTTP response. GETs are safe to retry
    // once: this absorbs the ~1-2s window where `nest --watch` is restarting.
    if (method === 'GET') {
      await new Promise((r) => setTimeout(r, 600))
      try {
        res = await fetch(`${baseUrl}${path}`, init)
      } catch (retryErr) {
        throw new ApiError(0, `Cannot reach API at ${baseUrl || path}`, retryErr)
      }
    } else {
      // Normalize into a typed ApiError so callers use isNetworkError/isApiError
      // instead of catching a raw TypeError (which crashes the SSR render).
      throw new ApiError(0, `Cannot reach API at ${baseUrl || path}`, e)
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new ApiError(
      res.status,
      (err as Record<string, string>)?.message ?? res.statusText,
      err,
    )
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text.trim()) return undefined as T
  return JSON.parse(text) as T
}

export const api = {
  get: <T>(
    path: string,
    opts?: { cookieHeader?: string; next?: { revalidate?: number | false; tags?: string[] } },
  ) => request<T>(path, { ...opts }),

  post: <T>(path: string, body: unknown, opts?: { cookieHeader?: string }) =>
    request<T>(path, { method: 'POST', body, ...opts }),

  patch: <T>(path: string, body: unknown, opts?: { cookieHeader?: string }) =>
    request<T>(path, { method: 'PATCH', body, ...opts }),

  delete: <T>(path: string, opts?: { cookieHeader?: string }) =>
    request<T>(path, { method: 'DELETE', ...opts }),
}
