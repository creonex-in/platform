import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AppUserSession } from '../auth/types'
import { LearnerService } from './learner.service'
import {
  CreateSavedDto, CreateNoteDto, UpdateNoteDto,
} from './learner.dto'

@ApiTags('Learner')
@ApiCookieAuth()
@Controller('v1/learner')
@UseGuards(AuthGuard, RolesGuard)
@Roles('learner')
export class LearnerController {
  constructor(private readonly learner: LearnerService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Aggregate for the learner home/hub' })
  getOverview(@Session() s: AppUserSession) {
    return this.learner.getOverview(s.user.id)
  }

  // ── Saved ──
  @Get('saved')
  listSaved(@Session() s: AppUserSession) {
    return this.learner.listSaved(s.user.id)
  }
  @Post('saved')
  addSaved(@Session() s: AppUserSession, @Body() dto: CreateSavedDto) {
    return this.learner.addSaved(s.user.id, dto)
  }
  @Delete('saved')
  removeSaved(
    @Session() s: AppUserSession,
    @Query('targetType') targetType: 'creator' | 'offering',
    @Query('targetId') targetId: string,
  ) {
    return this.learner.removeSaved(s.user.id, { targetType, targetId })
  }

  // ── Notes ──
  @Get('notes')
  listNotes(@Session() s: AppUserSession) {
    return this.learner.listNotes(s.user.id)
  }
  @Post('notes')
  createNote(@Session() s: AppUserSession, @Body() dto: CreateNoteDto) {
    return this.learner.createNote(s.user.id, dto)
  }
  @Patch('notes/:id')
  updateNote(@Session() s: AppUserSession, @Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.learner.updateNote(s.user.id, id, dto)
  }
  @Delete('notes/:id')
  deleteNote(@Session() s: AppUserSession, @Param('id') id: string) {
    return this.learner.deleteNote(s.user.id, id)
  }
}
