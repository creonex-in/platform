import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { verifyToken } from '@clerk/backend'
import { Request } from 'express'
import { ROLES_KEY } from './roles.decorator'
import { UsersService } from '../users/users.service'
import { ClerkPublicMetadata } from '../users/webhook-events.types'

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private config: ConfigService,
    private reflector: Reflector,
    private usersService: UsersService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>()

    try {
      // 1. Extract token
      const authHeader = req.headers['authorization']
      const bearerToken = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null
      const cookieToken: string | undefined = req.cookies?.['__session']
      const token = bearerToken ?? cookieToken
      if (!token) throw new Error('no token')

      // 2. Verify JWT — proves identity only
      const jwtKey = this.config.getOrThrow<string>('CLERK_JWT_KEY')
      const payload = await verifyToken(token, { jwtKey })

      // 3. Read roles from JWT claims — Clerk is authority, zero extra DB query
      // Field name depends on JWT template: default Clerk template uses 'metadata',
      // custom templates may use 'publicMetadata'
      const raw = payload as Record<string, unknown>
      const metadata = (raw.metadata ?? raw.publicMetadata) as
        Partial<ClerkPublicMetadata> | undefined

      const roles = metadata?.roles ?? ['learner']
      const onboardingComplete = metadata?.onboarding_complete ?? false
      const onboardingStep = metadata?.onboarding_step ?? 1

      // 4. One DB query — only to resolve internal userId for business queries
      const user = await this.usersService.getByClerkId(payload.sub)
      if (!user) throw new Error('user not found')

      // 5. Attach to request
      req.auth = {
        clerkUserId: payload.sub,
        sessionId: payload.sid,
        userId: user.id,
        roles,
        onboardingComplete,
        onboardingStep,
      }

      // 6. Role check
      const requiredRoles = this.reflector.getAllAndOverride<
        ('learner' | 'creator')[]
      >(ROLES_KEY, [context.getHandler(), context.getClass()])

      if (!requiredRoles || requiredRoles.length === 0) return true

      const hasRole = requiredRoles.some((role) => roles.includes(role))
      if (!hasRole) throw new Error('insufficient role')

      return true
    } catch {
      throw new UnauthorizedException('Unauthorized')
    }
  }
}
