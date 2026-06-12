import { Module } from '@nestjs/common'
import { CreatorsController } from './creators.controller'
import { CreatorsService } from './creators.service'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [UsersModule],
  controllers: [CreatorsController],
  providers: [CreatorsService],
})
export class CreatorsModule {}
