import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { createClerkClient } from '@clerk/backend'
// ClerkClient type shared via ReturnType<typeof createClerkClient> in each consumer
import { AuthModule } from '../auth/auth.module'
import { UsersModule } from '../users/users.module'
import { OnboardingController } from './onboarding.controller'
import { OnboardingService } from './onboarding.service'

@Module({
  imports: [ConfigModule, AuthModule, UsersModule],
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    {
      provide: 'CLERK_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createClerkClient({
          secretKey: config.getOrThrow<string>('CLERK_SECRET_KEY'),
        }),
    },
  ],
})
export class OnboardingModule {}
