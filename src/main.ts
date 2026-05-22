// Bootstraps the NestJS app — registers middleware, CORS, and starts the server.
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: true keeps the raw Buffer so Svix can verify webhook signatures
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Parses the Cookie header so req.cookies is available (used for the Clerk __session cookie)
  app.use(cookieParser());

  // Read allowed frontend origins from env; defaults to localhost for local dev
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // credentials: true is required for cookies to be sent cross-origin
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Secret'],
    credentials: true,
  });

  await app.listen(process.env.PORT!);
}

bootstrap();
