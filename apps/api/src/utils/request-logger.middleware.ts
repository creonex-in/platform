import { Injectable, Logger, type NestMiddleware } from '@nestjs/common'
import type { Request, Response, NextFunction } from 'express'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req
    const start = Date.now()

    res.on('finish', () => {
      const ms = Date.now() - start
      const { statusCode } = res
      const reqId = (req.headers['x-request-id'] as string) ?? '-'
      const msg = `[${reqId}] ${method} ${originalUrl} → ${statusCode} (${ms}ms)`

      if (statusCode >= 500) this.logger.error(msg)
      else if (statusCode >= 400) this.logger.warn(msg)
      else this.logger.log(msg)
    })

    next()
  }
}
