import { Body, Controller, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AppUserSession } from '../auth/types'
import { TestimonialsService } from './testimonials.service'
import { SubmitTestimonialDto, UpdateVisibilityDto } from './testimonials.dto'

// ── Creator-authenticated testimonials management ─────────────────────────────

@ApiTags('Testimonials')
@ApiCookieAuth()
@Controller('v1/creator/testimonials')
@UseGuards(AuthGuard, RolesGuard)
@Roles('creator')
export class CreatorTestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  @ApiOperation({ summary: 'List all testimonials (public + hidden) for my profile' })
  getAll(@Session() session: AppUserSession) {
    return this.testimonialsService.getCreatorTestimonials(session.user.id)
  }

  @Patch(':id/visibility')
  @HttpCode(204)
  @ApiOperation({ summary: 'Toggle testimonial visibility on public profile' })
  async updateVisibility(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Body() dto: UpdateVisibilityDto,
  ) {
    await this.testimonialsService.updateVisibility(session.user.id, id, dto)
  }
}

// ── Public testimonial submission (no auth) ───────────────────────────────────

@ApiTags('Testimonials')
@Controller('v1/testimonials')
export class PublicTestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post('submit/:username')
  @HttpCode(204)
  @ApiOperation({ summary: 'Submit a testimonial for a creator (public — no auth required)' })
  async submit(@Param('username') username: string, @Body() dto: SubmitTestimonialDto) {
    await this.testimonialsService.submitTestimonial(username, dto)
  }
}
