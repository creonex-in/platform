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
    const req = context.switchToHttp().getRequest<Request>();

    try {
      // TODO: re-enable in production
      // const clientSecret = this.config.get<string>('CLIENT_SECRET_HEADER');
      // if (clientSecret && req.headers['x-client-secret'] !== clientSecret) {
      //   throw new Error('invalid client secret');
      // }

      const cookieToken: string | undefined = req.cookies?.['__session'];
      const authHeader = req.headers['authorization'];
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      const token = cookieToken ?? bearerToken;
      if (!token) throw new Error('no token');
      const jwtKey = this.config.getOrThrow<string>('CLERK_JWT_KEY');
      const allowedOrigins = this.config
        .get<string>('ALLOWED_ORIGINS', '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = await verifyToken(token, {
        jwtKey,
        authorizedParties: allowedOrigins,
      });

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
