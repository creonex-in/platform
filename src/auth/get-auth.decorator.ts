import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export const GetAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.auth;
  },
);

export const GetClerkUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.auth?.clerkUserId;
  },
);

export const RawBody = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Buffer | undefined => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return req.rawBody;
  },
);
