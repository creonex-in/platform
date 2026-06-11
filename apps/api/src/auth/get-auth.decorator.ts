import { createParamDecorator, type ExecutionContext } from '@nestjs/common'

export const GetAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.auth
  },
)

export const GetSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.betterAuthSession
  },
)
