import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UsersRepository } from './users.repository'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, RolesGuard, Reflector],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
