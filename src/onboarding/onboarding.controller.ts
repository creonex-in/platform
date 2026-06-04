import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpCode,
} from '@nestjs/common'
import { ClerkAuthGuard } from '../auth/clerk.guard'
import { Roles } from '../auth/roles.decorator'
import { GetAuth } from '../auth/get-auth.decorator'
import { OnboardingService } from './onboarding.service'
import {
  LearnerStep1Dto,
  LearnerStep2Dto,
  CreatorStep1Dto,
  CreatorStep2Dto,
  CreatorStep3Dto,
} from './onboarding.dto'

@Controller('api/v1/onboarding')
@UseGuards(ClerkAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  // ── Learner ──────────────────────────────────────────

  @Post('learner/step-1')
  @HttpCode(200)
  @Roles('learner')
  async learnerStep1(
    @GetAuth() auth: Express.Request['auth'],
    @Body() dto: LearnerStep1Dto,
  ) {
    return this.onboardingService.saveLearnerStep1(
      auth!.userId,
      auth!.clerkUserId,
      dto,
    )
  }

  @Post('learner/step-2')
  @HttpCode(200)
  @Roles('learner')
  async learnerStep2(
    @GetAuth() auth: Express.Request['auth'],
    @Body() dto: LearnerStep2Dto,
  ) {
    return this.onboardingService.saveLearnerStep2(
      auth!.userId,
      auth!.clerkUserId,
      dto,
    )
  }

  // ── Creator ──────────────────────────────────────────

  @Post('creator/step-1')
  @HttpCode(200)
  @Roles('creator')
  async creatorStep1(
    @GetAuth() auth: Express.Request['auth'],
    @Body() dto: CreatorStep1Dto,
  ) {
    return this.onboardingService.saveCreatorStep1(
      auth!.userId,
      auth!.clerkUserId,
      dto,
    )
  }

  @Post('creator/step-2')
  @HttpCode(200)
  @Roles('creator')
  async creatorStep2(
    @GetAuth() auth: Express.Request['auth'],
    @Body() dto: CreatorStep2Dto,
  ) {
    return this.onboardingService.saveCreatorStep2(
      auth!.userId,
      auth!.clerkUserId,
      dto,
    )
  }

  @Post('creator/step-3')
  @HttpCode(200)
  @Roles('creator')
  async creatorStep3(
    @GetAuth() auth: Express.Request['auth'],
    @Body() dto: CreatorStep3Dto,
  ) {
    return this.onboardingService.saveCreatorStep3GoLive(
      auth!.userId,
      auth!.clerkUserId,
      dto,
    )
  }
}
