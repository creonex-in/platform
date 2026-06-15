import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UploadsController } from './uploads.controller'
import { UploadsService } from './uploads.service'
import { RolesGuard } from '../auth/roles.guard'

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, RolesGuard, Reflector],
  exports: [UploadsService],
})
export class UploadsModule {}
