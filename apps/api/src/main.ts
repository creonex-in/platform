import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { toNodeHandler } from 'better-auth/node'
import { AuthService } from '@mguay/nestjs-better-auth'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false })

  const expressApp = app.getHttpAdapter().getInstance()
  const authService = app.get<AuthService>(AuthService)

  // Mount Better Auth before body parsers
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  expressApp.all(/^\/api\/auth\/.*/, toNodeHandler(authService.instance.handler))

  // Re-enable body parser after Better Auth
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  expressApp.use(require('express').json())

  app.use(cookieParser())

  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  )

  app.enableCors({
    origin: process.env['ALLOWED_ORIGINS']?.split(',') ?? 'http://localhost:3001',
    credentials: true,
  })

  const config = new DocumentBuilder()
    .setTitle('Creonex API')
    .setDescription('REST API for Creonex platform')
    .setVersion('1.0')
    .addCookieAuth('better-auth.session_token')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(process.env['PORT'] ?? 3000)
}

bootstrap()
