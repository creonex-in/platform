import {
  Body, Controller, Delete, Get, HttpCode,
  Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common'
import { AuthGuard, Session } from '@mguay/nestjs-better-auth'
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../auth/roles.decorator'
import { RolesGuard } from '../auth/roles.guard'
import type { AppUserSession } from '../auth/types'
import { SchedulesService } from './schedules.service'
import { SlotGenerationService } from './slot-generation.service'
import {
  AddOverrideDto, AddRuleDto, CreateScheduleDto,
  GetSlotsQueryDto, UpdateRuleDto, UpdateScheduleDto,
} from './availability.dto'

// ── Creator schedule management ────────────────────────────────────────────────

@ApiTags('Schedules')
@ApiCookieAuth()
@Controller('v1/schedules')
@UseGuards(AuthGuard, RolesGuard)
@Roles('creator')
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly slotService: SlotGenerationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List creator schedules' })
  getMySchedules(@Session() session: AppUserSession) {
    return this.schedulesService.getMySchedules(session.user.id)
  }

  @Post()
  @ApiOperation({ summary: 'Create a new schedule' })
  createSchedule(@Session() session: AppUserSession, @Body() dto: CreateScheduleDto) {
    return this.schedulesService.createSchedule(session.user.id, dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get schedule with rules and overrides' })
  getSchedule(@Session() session: AppUserSession, @Param('id') id: string) {
    return this.schedulesService.getSchedule(id, session.user.id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update schedule metadata' })
  updateSchedule(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.updateSchedule(id, session.user.id, dto)
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete schedule (cascades rules + overrides)' })
  deleteSchedule(@Session() session: AppUserSession, @Param('id') id: string) {
    return this.schedulesService.deleteSchedule(id, session.user.id)
  }

  // ── Rules ──────────────────────────────────────────────────────────────────

  @Post(':id/rules')
  @ApiOperation({ summary: 'Add availability rule (RRULE + time window)' })
  addRule(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Body() dto: AddRuleDto,
  ) {
    return this.schedulesService.addRule(id, session.user.id, dto)
  }

  @Patch(':id/rules/:ruleId')
  @ApiOperation({ summary: 'Update an availability rule' })
  updateRule(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateRuleDto,
  ) {
    return this.schedulesService.updateRule(id, ruleId, session.user.id, dto)
  }

  @Delete(':id/rules/:ruleId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete an availability rule' })
  deleteRule(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Param('ruleId') ruleId: string,
  ) {
    return this.schedulesService.deleteRule(id, ruleId, session.user.id)
  }

  // ── Overrides ──────────────────────────────────────────────────────────────

  @Post(':id/overrides')
  @ApiOperation({ summary: 'Add a date override (blocked day or custom hours)' })
  addOverride(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Body() dto: AddOverrideDto,
  ) {
    return this.schedulesService.addOverride(id, session.user.id, dto)
  }

  @Delete(':id/overrides/:overrideId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a date override' })
  deleteOverride(
    @Session() session: AppUserSession,
    @Param('id') id: string,
    @Param('overrideId') overrideId: string,
  ) {
    return this.schedulesService.deleteOverride(id, overrideId, session.user.id)
  }
}

// ── Public slot availability ────────────────────────────────────────────────────

@ApiTags('Availability')
@ApiCookieAuth()
@Controller('v1/availability')
@UseGuards(AuthGuard, RolesGuard)
export class AvailabilityController {
  constructor(private readonly slotService: SlotGenerationService) {}

  @Get('offerings/:offeringId/slots')
  @ApiOperation({
    summary: 'Get available booking slots for an offering',
    description: 'Returns slots in UTC + learner local time. No role required — any authenticated user.',
  })
  getSlots(
    @Param('offeringId') offeringId: string,
    @Query() query: GetSlotsQueryDto,
  ) {
    return this.slotService.generateSlots({
      offeringId,
      learnerTz: query.timezone,
      fromDate: query.from,
      toDate: query.to,
    })
  }
}
