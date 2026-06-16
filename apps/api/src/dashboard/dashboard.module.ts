import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { DashboardRepository } from './dashboard.repository'
import { UsersModule } from '../users/users.module'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  imports: [UsersModule],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository, RolesGuard, Reflector],
})
export class DashboardModule {}
