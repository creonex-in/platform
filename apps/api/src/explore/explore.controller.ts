import { Controller, Get, HttpCode, Query, UseGuards } from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import type { AppUserSession } from '../auth/types'
import { ExploreService } from './explore.service'
import { BrowseOfferingsQueryDto } from './explore.query.dto'

@ApiTags('Explore')
@Controller('v1/explore')
export class ExploreController {
  constructor(private readonly explore: ExploreService) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Public: browse/search live offerings joined with their creator' })
  browse(@Query() query: BrowseOfferingsQueryDto) {
    return this.explore.browse(query)
  }

  @Get('recommended')
  @HttpCode(200)
  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Personalized: offerings in the learner’s interested niches' })
  recommended(@Session() session: AppUserSession) {
    return this.explore.recommended(session.user.id)
  }
}
