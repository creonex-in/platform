import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'

interface ErrorBody {
  statusCode: number
  message: string
  error: string
  path: string
  timestamp: string
}

/** Better Auth APIError: { status: 'UNAUTHORIZED', statusCode: 401, body: { message } }. */
interface BetterAuthApiError {
  name: string
  status: string | number
  statusCode: number
  body?: { message?: string }
}

function isBetterAuthApiError(e: unknown): e is BetterAuthApiError {
  return (
    typeof e === 'object' &&
    e !== null &&
    (e as { name?: string }).name === 'APIError' &&
    typeof (e as { statusCode?: unknown }).statusCode === 'number'
  )
}

/**
 * Normalizes every thrown error into a single JSON envelope so clients (and
 * the web app's ApiError) always see the same shape. 4xx surfaces its real
 * message; unexpected 5xx is logged with the stack and returns a generic
 * message (no internals leaked).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception')

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    const req = ctx.getRequest<Request>()

    let status: number
    let message: string
    let error: string

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const response = exception.getResponse()
      // Nest puts validation messages under `message` (string | string[]).
      const payload = (typeof response === 'object' ? response : { message: response }) as {
        message?: string | string[]
        error?: string
      }
      message = Array.isArray(payload.message)
        ? payload.message.join(', ')
        : (payload.message ?? exception.message)
      error = payload.error ?? exception.name
    } else if (isBetterAuthApiError(exception)) {
      // Better Auth throws its own APIError (not a Nest HttpException);
      // `@Catch()` intercepts it before the library can map it, so map here.
      status = exception.statusCode
      message = exception.body?.message ?? String(exception.status)
      error = String(exception.status)
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = 'Internal server error'
      error = 'InternalServerError'
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${req.method} ${req.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      )
    }

    const body: ErrorBody = {
      statusCode: status,
      message,
      error,
      path: req.url,
      timestamp: new Date().toISOString(),
    }

    res.status(status).json(body)
  }
}
