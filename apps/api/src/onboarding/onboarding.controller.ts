import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiTags, ApiCookieAuth, ApiOperation } from '@nestjs/swagger'
import { OnboardingService } from './onboarding.service'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import { LearnerStep1Dto, CreatorStep1Dto, CreatorStep2Dto, CreatorStep3Dto, CreatorStep4Dto } from './onboarding.dto'
import type { AppUserSession } from '../auth/types'

@ApiTags('Onboarding')
@ApiCookieAuth()
@Controller('v1/onboarding')
@UseGuards(AuthGuard, RolesGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('learner/step-1')
  @Roles('learner')
  @HttpCode(200)
  @ApiOperation({ summary: 'Save learner onboarding — name + goal' })
  learnerStep1(@Session() session: AppUserSession, @Body() dto: LearnerStep1Dto) {
    return this.onboardingService.saveLearnerStep1(session.user.id, dto)
  }

  @Post('creator/step-1')
  @Roles('creator')
  @HttpCode(200)
  @ApiOperation({ summary: 'Save creator step 1 — name + discovery questions' })
  creatorStep1(@Session() session: AppUserSession, @Body() dto: CreatorStep1Dto) {
    return this.onboardingService.saveCreatorStep1(session.user.id, dto)
  }

  @Post('creator/step-2')
  @Roles('creator')
  @HttpCode(200)
  @ApiOperation({ summary: 'Save creator step 2 — bio + tags + photo + social links' })
  creatorStep2(@Session() session: AppUserSession, @Body() dto: CreatorStep2Dto) {
    return this.onboardingService.saveCreatorStep2(session.user.id, dto)
  }

  @Post('creator/step-3')
  @Roles('creator')
  @HttpCode(200)
  @ApiOperation({ summary: 'Save creator step 3 — banner + languages' })
  creatorStep3(@Session() session: AppUserSession, @Body() dto: CreatorStep3Dto) {
    return this.onboardingService.saveCreatorStep3(session.user.id, dto)
  }

  @Post('creator/step-4')
  @Roles('creator')
  @HttpCode(200)
  @ApiOperation({ summary: 'Save creator step 4 — first offering + go live' })
  creatorStep4(@Session() session: AppUserSession, @Body() dto: CreatorStep4Dto) {
    return this.onboardingService.saveCreatorStep4(session.user.id, dto)
  }
}
