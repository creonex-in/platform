// API client — cookie-based auth (better-auth session_token)
// All requests (client + server) use NEXT_PUBLIC_API_URL → direct to NestJS
// Server components pass cookieHeader manually; browser sends cookie automatically via credentials: 'include'

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

export function isRetryable(e: unknown): boolean {
  return isApiError(e) && e.status >= 500
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: Method
  body?: unknown
  cookieHeader?: string // server-side only: forwarded from Next.js request
  next?: { revalidate?: number | false; tags?: string[] }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, cookieHeader, next } = options
  const isServer = typeof window === 'undefined'

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (isServer && cookieHeader) headers['Cookie'] = cookieHeader

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: isServer ? 'omit' : 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(next ? { next } : { cache: 'no-store' }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new ApiError(
      res.status,
      (err as Record<string, string>)?.message ?? res.statusText,
      err,
    )
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
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
