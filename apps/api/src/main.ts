import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { toNodeHandler } from 'better-auth/node'
import { AuthService } from '@mguay/nestjs-better-auth'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './utils/all-exceptions.filter'
import { apiRateLimit, authRateLimit } from './utils/rate-limiter'
import { validateConfig } from './utils/config-guard'
import type { Request, Response, NextFunction } from 'express'

const BODY_LIMIT = '512kb'

async function bootstrap() {
  validateConfig()

  const app = await NestFactory.create(AppModule, { bodyParser: false })

  const expressApp = app.getHttpAdapter().getInstance()
  // Railway (and most PaaS) terminate TLS at a proxy and forward over http.
  // Trust the proxy so Express/better-auth see x-forwarded-proto=https and
  // honor Secure cookies + build https callback URLs.
  expressApp.set('trust proxy', 1)
  const authService = app.get<AuthService>(AuthService)

  const express = require('express') // eslint-disable-line @typescript-eslint/no-require-imports
  // Razorpay webhook needs raw body for HMAC signature verification
  expressApp.use('/api/v1/payments/webhook', express.raw({ type: 'application/json', limit: BODY_LIMIT }))
  expressApp.use(express.json({ limit: BODY_LIMIT }))

  // Auth: strict brute-force limiter before better-auth handler
  expressApp.use('/api/auth', authRateLimit)
  expressApp.all(/^\/api\/auth\/.*/, toNodeHandler(authService.instance.handler))

  // General API limiter on all NestJS routes — skip the Razorpay webhook
  // (server-to-server; must never be blocked)
  expressApp.use('/api/v1', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/payments/webhook')) return next()
    return apiRateLimit(req, res, next)
  })

  // Security headers — CSP disabled: pure JSON API + Swagger UI in dev
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
  app.use(cookieParser())
  app.use(compression()) // gzip responses — large slot payloads compress ~85%

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  )

  app.useGlobalFilters(new AllExceptionsFilter())

  app.enableShutdownHooks()

  // Give the load balancer 5s to drain traffic before NestJS closes connections
  process.on('SIGTERM', () => {
    setTimeout(() => void app.close(), 5000)
  })

  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? 'http://localhost:3001',
    credentials: true,
  })

  if (process.env['NODE_ENV'] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Creonex API')
      .setDescription('REST API for Creonex platform')
      .setVersion('1.0')
      .addCookieAuth('better-auth.session_token')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
  }

  await app.listen(process.env['PORT'] ?? 3000)
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err)
  process.exit(1)
})
