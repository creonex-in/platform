import {
  Injectable,
  CanActivate,
  type ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './roles.decorator'
import { parseRoles, type UserRole } from '@creonex/types'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ])

    if (!required || required.length === 0) return true

    const request = ctx.switchToHttp().getRequest()
    const session = request.session

    if (!session?.user?.role) throw new UnauthorizedException()

    const userRoles = parseRoles(session.user.role)
    const hasRole = required.some((r) => userRoles.includes(r))

    if (!hasRole) throw new UnauthorizedException('Insufficient role')
    return true
  }
}
