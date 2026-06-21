import { Controller, Get, Inject } from '@nestjs/common'
import { sql } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from './database/database-connection'
import { cache } from './utils/cache'

@Controller()
export class AppController {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  @Get()
  ping() {
    return { status: 'ok', service: 'creonex-api' }
  }

  @Get('health')
  async health() {
    const checks: Record<string, 'ok' | 'error'> = {}

    try {
      await this.db.execute(sql`SELECT 1`)
      checks['db'] = 'ok'
    } catch {
      checks['db'] = 'error'
    }

    if (process.env['UPSTASH_REDIS_REST_URL']) {
      try {
        await cache.set('health:ping', '1', 5)
        checks['redis'] = 'ok'
      } catch {
        checks['redis'] = 'error'
      }
    }

    const allOk = Object.values(checks).every((v) => v === 'ok')
    return {
      status: allOk ? 'ok' : 'degraded',
      service: 'creonex-api',
      checks,
      timestamp: new Date().toISOString(),
    }
  }
}
