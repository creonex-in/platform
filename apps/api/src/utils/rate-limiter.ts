import { Logger } from '@nestjs/common'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { Request, Response, NextFunction } from 'express'

const logger = new Logger('RateLimiter')
type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void

// One shared HTTP client for both limiters — no persistent socket, no connection pool
const redis: Redis | null = (() => {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    logger.warn('UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set — rate limiting disabled (local dev)')
    return null
  }
  return new Redis({ url, token })
})()

// Each limiter gets its own ephemeralCache Map so API and auth buckets don't share in-process state
const apiLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(150, '60 s'), prefix: 'rl:api',  ephemeralCache: new Map() })
  : null
const authLimiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20,  '15 m'), prefix: 'rl:auth', ephemeralCache: new Map() })
  : null

function clientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for']
  const raw = (typeof fwd === 'string' ? fwd.split(',')[0] : req.ip) ?? 'unknown'
  return raw.trim().replace(/^::ffff:/, '')
}

function toMiddleware(limiter: Ratelimit | null, label: string): ExpressMiddleware {
  if (!limiter) return (_req, _res, next) => next()
  return (req: Request, res: Response, next: NextFunction): void => {
    limiter
      .limit(clientIp(req))
      .then(({ success, remaining, reset }) => {
        res.setHeader('X-RateLimit-Remaining', remaining)
        res.setHeader('X-RateLimit-Reset', reset)
        if (!success) {
          res.status(429).json({
            statusCode: 429,
            message: 'Too many requests. Try again later.',
            error: 'TooManyRequests',
          })
          return
        }
        next()
      })
      .catch((err) => {
        // Fail open — never block traffic because Upstash is temporarily unreachable
        logger.warn(`Rate limit check failed (${label}): ${String(err)}`)
        next()
      })
  }
}

export const apiRateLimit  = toMiddleware(apiLimiter,  'api')
export const authRateLimit = toMiddleware(authLimiter, 'auth')
