// ─── Auth Param Decorators ────────────────────────────────────────────────────
// NestJS param decorators let you pull specific values out of the request
// and inject them directly into controller method parameters.
//
// After ClerkAuthGuard runs and populates req.auth, these decorators give
// controllers a clean, typed way to access auth data without touching req directly.
//
// Usage examples in a controller:
//   async getMe(@GetAuth() auth: { clerkUserId: string; sessionId: string }) { ... }
//   async getMe(@GetClerkUserId() clerkUserId: string) { ... }
//   async handleWebhook(@RawBody() body: Buffer) { ... }

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

// @GetAuth() — injects the full auth object { clerkUserId, sessionId } from req.auth.
// Use when you need both the user ID and the session ID.
export const GetAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.auth;
  },
);

// @GetClerkUserId() — injects just the Clerk user ID string from req.auth.
// Use on most protected routes where you only need to identify the user.
export const GetClerkUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.auth?.clerkUserId;
  },
);

// @RawBody() — injects the raw Buffer body from req.rawBody.
// NestJS normally parses JSON bodies and discards the raw bytes, but
// rawBody: true in main.ts preserves them. This is required by Svix
// to verify webhook signatures — verifying against a parsed object won't work.
export const RawBody = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Buffer | undefined => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.rawBody;
  },
);
