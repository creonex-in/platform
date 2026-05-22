// ─── Entry Point ────────────────────────────────────────────────────────────
// This is the very first file NestJS runs. It creates the HTTP server,
// registers global middleware (cookies, CORS), and starts listening on a port.
// Think of it as the "power button" for the whole API.

import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create the NestJS application.
  // rawBody: true — keeps the raw request buffer alive so Svix (webhook library)
  // can verify the signature of incoming Clerk webhook payloads.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // cookie-parser middleware: parses the Cookie header on every request and
  // populates req.cookies so we can read the __session cookie set by Clerk.
  app.use(cookieParser());

  // Read the allowed frontend origins from the environment variable.
  // Defaults to localhost:3000 for local development.
  // Multiple origins can be separated by commas: "https://app.com,https://www.app.com"
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // CORS: tells the browser which frontend URLs are allowed to call this API.
  // Without this, browsers block cross-origin requests from the frontend.
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Secret'],
    credentials: true, // required for cookies (the Clerk __session cookie) to be sent cross-origin
  });

  // Start the HTTP server on the port specified in the environment (e.g. PORT=3001).
  await app.listen(process.env.PORT!);
}

bootstrap();
