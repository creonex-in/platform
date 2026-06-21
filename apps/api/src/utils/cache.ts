import { Logger } from '@nestjs/common'
import { Redis } from '@upstash/redis'

const logger = new Logger('Cache')

const redis: Redis | null = (() => {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
})()

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null
    try { return await redis.get<T>(key) }
    catch (err: any) { logger.warn(`cache.get(${key}): ${String(err.message)}`); return null }
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!redis) return
    try { await redis.set(key, value, { ex: ttlSeconds }) }
    catch (err: any) { logger.warn(`cache.set(${key}): ${String(err.message)}`) }
  },

  async del(key: string): Promise<void> {
    if (!redis) return
    try { await redis.del(key) }
    catch (err: any) { logger.warn(`cache.del(${key}): ${String(err.message)}`) }
  },
}
