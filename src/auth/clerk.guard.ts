// Guard that protects routes by verifying Clerk JWTs.
// Reads the token from the __session cookie or the Authorization header,
// then attaches { clerkUserId, sessionId } to req.auth on success.
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

  // Returns true if the request carries a valid Clerk JWT; throws 401 otherwise.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    try {
      // TODO: re-enable in production
      // const clientSecret = this.config.get<string>('CLIENT_SECRET_HEADER');
      // if (clientSecret && req.headers['x-client-secret'] !== clientSecret) {
      //   throw new Error('invalid client secret');
      // }

      // Prefer the cookie token (browser flow); fall back to Bearer header (API/mobile)
      const cookieToken: string | undefined = req.cookies?.['__session'];
      const authHeader = req.headers['authorization'];
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      const token = cookieToken ?? bearerToken;
      if (!token) throw new Error('no token');

      const jwtKey = this.config.getOrThrow<string>('CLERK_JWT_KEY');

      // authorizedParties prevents tokens issued for other apps from being accepted here
      const allowedOrigins = this.config
        .get<string>('ALLOWED_ORIGINS', '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = await verifyToken(token, {
        jwtKey,
        authorizedParties: allowedOrigins,
      });

      // Make the verified identity available to controllers via @GetClerkUserId()
      req.auth = {
        clerkUserId: payload.sub,
        sessionId: payload.sid,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }
  }
}
