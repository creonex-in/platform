import { Logger } from '@nestjs/common'
import { RateLimiterRedis, RateLimiterMemory, type RateLimiterAbstract } from 'rate-limiter-flexible'
import Redis from 'ioredis'
import type { Request, Response, NextFunction } from 'express'

const logger = new Logger('RateLimiter')

function buildRedis(): Redis | null {
  const url = process.env.REDIS_URL
  if (!url) return null
  const client = new Redis(url, {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
  })
  client.on('error', (err: Error) => logger.warn(`Redis error: ${err.message}`))
  return client
}

const redis = buildRedis()

function buildLimiter(keyPrefix: string, points: number, duration: number): RateLimiterAbstract {
  if (redis) {
    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix,
      points,
      duration,
      blockDuration: 0, // reject only — don't extend block window
    })
  }
  logger.warn(
    `REDIS_URL not set — "${keyPrefix}" using in-memory limiter (not load-balancer safe)`,
  )
  return new RateLimiterMemory({ keyPrefix, points, duration })
}

// 150 req / 60 s per IP across all NestJS API routes
const apiLimiter = buildLimiter('rl:api', 150, 60)

// 20 attempts / 15 min per IP — brute-force guard on auth routes
const authLimiter = buildLimiter('rl:auth', 20, 900)

function clientIp(req: Request): string {
  // X-Forwarded-For is set by Railway / load balancers (trust proxy 1 is already set)
  const fwd = req.headers['x-forwarded-for']
  const raw = (typeof fwd === 'string' ? fwd.split(',')[0] : req.ip) ?? 'unknown'
  return raw.trim().replace(/^::ffff:/, '')
}

type ExpressMiddleware = (req: Request, res: Response, next: NextFunction) => void

function toMiddleware(limiter: RateLimiterAbstract): ExpressMiddleware {
  return (req: Request, res: Response, next: NextFunction): void => {
    limiter
      .consume(clientIp(req))
      .then((result) => {
        res.setHeader('X-RateLimit-Remaining', result.remainingPoints)
        next()
      })
      .catch(() => {
        res.status(429).json({
          statusCode: 429,
          message: 'Too many requests, please try again later.',
          error: 'TooManyRequests',
        })
      })
  }
}

export const apiRateLimit = toMiddleware(apiLimiter)
export const authRateLimit = toMiddleware(authLimiter)
