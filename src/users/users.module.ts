import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { createClerkClient } from '@clerk/backend'
import { ClerkAuthGuard } from '../auth/clerk.guard'
import { DatabaseModule } from '../database/database.module'
import { UsersController } from './users.controller'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'
import { WebhooksController } from './webhooks.controller'

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [UsersController, WebhooksController],
  providers: [
    UsersRepository,
    UsersService,
    Reflector,
    ClerkAuthGuard,
    {
      provide: 'CLERK_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createClerkClient({
          secretKey: config.getOrThrow<string>('CLERK_SECRET_KEY'),
        }),
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
