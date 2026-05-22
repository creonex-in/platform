// Custom param decorators that extract auth data from the request object.
// Use these in controller method signatures instead of accessing req directly.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

// Returns the full auth object { clerkUserId, sessionId } set by ClerkAuthGuard.
export const GetAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.auth;
  },
);

// Returns just the Clerk user ID string — the most commonly needed auth value.
export const GetClerkUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.auth?.clerkUserId;
  },
);

// Returns the raw request body as a Buffer — required by Svix for webhook signature verification.
export const RawBody = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Buffer | undefined => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.rawBody;
  },
);
