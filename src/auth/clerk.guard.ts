// ─── Clerk Auth Guard ─────────────────────────────────────────────────────────
// A NestJS route guard that protects endpoints by verifying Clerk JWTs.
//
// How it works:
//  1. Looks for the Clerk session token in two places:
//     a) The __session cookie (set by Clerk's frontend SDK automatically).
//     b) The Authorization: Bearer <token> header (for API clients / mobile).
//  2. Verifies the token's signature using the CLERK_JWT_KEY env variable.
//  3. If valid, attaches { clerkUserId, sessionId } to req.auth so controllers
//     can access the authenticated user's identity downstream.
//  4. If invalid or missing, throws 401 Unauthorized.
//
// Apply this guard to any route that should only be accessible to logged-in users:
//   @UseGuards(ClerkAuthGuard)

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';
import { Request } from 'express';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Pull the raw Express request out of the NestJS execution context.
    const req = context.switchToHttp().getRequest<Request>();

    try {
      // TODO: re-enable in production
      // const clientSecret = this.config.get<string>('CLIENT_SECRET_HEADER');
      // if (clientSecret && req.headers['x-client-secret'] !== clientSecret) {
      //   throw new Error('invalid client secret');
      // }

      // Try to get the token from the Clerk session cookie first (browser flow),
      // then fall back to the Authorization header (API / mobile flow).
      const cookieToken: string | undefined = req.cookies?.['__session'];
      const authHeader = req.headers['authorization'];
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      const token = cookieToken ?? bearerToken;
      if (!token) throw new Error('no token');

      // CLERK_JWT_KEY is the RS256 public key from the Clerk dashboard.
      // It lets us verify tokens locally without a network round-trip to Clerk.
      const jwtKey = this.config.getOrThrow<string>('CLERK_JWT_KEY');

      // authorizedParties restricts which frontend origins are allowed to use
      // tokens issued to this API, preventing token reuse across apps.
      const allowedOrigins = this.config
        .get<string>('ALLOWED_ORIGINS', '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // verifyToken checks the signature, expiry, and authorizedParties claim.
      const payload = await verifyToken(token, {
        jwtKey,
        authorizedParties: allowedOrigins,
      });

      // Attach the verified identity to the request object so downstream
      // controllers/services can access it via the @GetClerkUserId() decorator.
      req.auth = {
        clerkUserId: payload.sub, // "sub" is the Clerk user ID (e.g. "user_abc123")
        sessionId: payload.sid,   // session ID, useful for session revocation
      };

      return true; // allow the request to proceed
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
