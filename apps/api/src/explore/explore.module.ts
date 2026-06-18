import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { ExploreController } from './explore.controller'
import { ExploreService } from './explore.service'
import { ExploreRepository } from './explore.repository'

@Module({
  imports: [UsersModule],
  controllers: [ExploreController],
  providers: [ExploreService, ExploreRepository],
})
export class ExploreModule {}
