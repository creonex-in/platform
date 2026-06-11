import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { OnboardingController } from './onboarding.controller'
import { OnboardingService } from './onboarding.service'
import { UsersModule } from '../users/users.module'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  imports: [UsersModule],
  controllers: [OnboardingController],
  providers: [OnboardingService, RolesGuard, Reflector],
})
export class OnboardingModule {}
