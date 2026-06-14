import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { toNodeHandler } from 'better-auth/node'
import { AuthService } from '@mguay/nestjs-better-auth'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './utils/all-exceptions.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  const expressApp = app.getHttpAdapter().getInstance()
  const authService = app.get<AuthService>(AuthService)

  const express = require('express') // eslint-disable-line @typescript-eslint/no-require-imports
  // Razorpay webhook needs raw body for HMAC signature verification
  expressApp.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }))
  expressApp.use(express.json())
  expressApp.all(/^\/api\/auth\/.*/, toNodeHandler(authService.instance.handler))

  app.use(cookieParser())
  app.use(compression()) // gzip responses — large slot payloads compress ~85%

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  )

  app.useGlobalFilters(new AllExceptionsFilter())

  app.enableShutdownHooks()

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
