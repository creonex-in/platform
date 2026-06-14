import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AppUserSession } from '../auth/types'
import { OfferingsService } from './offerings.service'
import { CreateOfferingDto, UpdateOfferingDto, UpdateOfferingStatusDto } from './offerings.dto'

@ApiTags('Offerings')
@ApiCookieAuth()
@Controller('v1/offerings')
@UseGuards(AuthGuard, RolesGuard)
@Roles('creator')
export class OfferingsController {
  constructor(private readonly offeringsService: OfferingsService) {}

  @Get('me')
  @ApiOperation({ summary: 'List all offerings owned by the authenticated creator' })
  getMyOfferings(@Session() session: AppUserSession) {
    return this.offeringsService.getMyOfferings(session.user.id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new offering (starts as draft)' })
  createOffering(
    @Session() session: AppUserSession,
    @Body() dto: CreateOfferingDto,
  ) {
    return this.offeringsService.createOffering(session.user.id, dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single offering by id (must be owner)' })
  getOffering(@Session() session: AppUserSession, @Param('id') id: string) {
    return this.offeringsService.getOffering(id, session.user.id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update offering fields (not allowed when archived)' })
  updateOffering(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Body() dto: UpdateOfferingDto,
  ) {
    return this.offeringsService.updateOffering(id, session.user.id, dto)
  }

  @Patch(':id/status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Transition offering status (state machine enforced)' })
  transitionStatus(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Body() dto: UpdateOfferingStatusDto,
  ) {
    return this.offeringsService.transitionStatus(id, session.user.id, dto.status)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hard delete a draft offering (only when it has no bookings)' })
  deleteOffering(@Session() session: AppUserSession, @Param('id') id: string) {
    return this.offeringsService.deleteOffering(id, session.user.id)
  }
}
