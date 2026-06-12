import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UsersRepository } from './users.repository'
import { CreatorProfileRepository } from './creator-profile.repository'
import { LearnerProfileRepository } from './learner-profile.repository'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    CreatorProfileRepository,
    LearnerProfileRepository,
    RolesGuard,
    Reflector,
  ],
  exports: [UsersService, UsersRepository, CreatorProfileRepository, LearnerProfileRepository],
})
export class UsersModule {}
