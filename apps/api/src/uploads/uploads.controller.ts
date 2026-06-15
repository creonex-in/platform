import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AppUserSession } from '../auth/types'
import { UploadsService } from './uploads.service'
import { ConfirmUploadDto, DeleteUploadDto, PresignUploadDto } from './uploads.dto'

@ApiTags('Uploads')
@ApiCookieAuth()
@Controller('v1/uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('creator')
  @ApiOperation({ summary: 'Get a presigned URL to upload a file directly to S3 (STUB)' })
  presign(@Session() session: AppUserSession, @Body() dto: PresignUploadDto) {
    return this.uploadsService.presign(session.user.id, dto)
  }

  @Post('confirm')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('creator')
  @ApiOperation({ summary: 'Confirm a finished upload and persist its key (STUB)' })
  confirm(@Body() dto: ConfirmUploadDto) {
    return this.uploadsService.confirm(dto.key)
  }

  // key contains '/', so it's passed in the body rather than the path.
  @Post('delete')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('creator')
  @ApiOperation({ summary: 'Delete an uploaded object by key (STUB)' })
  delete(@Body() dto: DeleteUploadDto) {
    return this.uploadsService.delete(dto.key)
  }

  @Get('digital/:bookingId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('learner')
  @ApiOperation({ summary: 'Buyer-gated download links for a purchased digital product (STUB)' })
  digitalAccess(@Param('bookingId') bookingId: string) {
    return this.uploadsService.digitalAccess(bookingId)
  }
}
