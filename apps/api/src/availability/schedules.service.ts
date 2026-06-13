import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreatorProfileRepository } from '../users/creator-profile.repository'
import { SchedulesRepository } from './schedules.repository'
import type { CreateScheduleDto, UpdateScheduleDto, AddRuleDto, UpdateRuleDto, AddOverrideDto } from './availability.dto'

@Injectable()
export class SchedulesService {
  constructor(
    private readonly schedulesRepo: SchedulesRepository,
    private readonly creatorProfileRepo: CreatorProfileRepository,
  ) {}

  private async resolveProfileId(userId: string): Promise<string> {
    const profile = await this.creatorProfileRepo.findByUserId(userId)
    if (!profile) throw new NotFoundException('Creator profile not found')
    return profile.id
  }

  private async assertOwnsSchedule(scheduleId: string, userId: string) {
    const profileId = await this.resolveProfileId(userId)
    const schedule = await this.schedulesRepo.findByIdForOwner(scheduleId, profileId)
    if (!schedule) throw new NotFoundException('Schedule not found')
    return { profileId, schedule }
  }

  // ── Schedules ───────────────────────────────────────────────────────────────

  async getMySchedules(userId: string) {
    const profileId = await this.resolveProfileId(userId)
    return this.schedulesRepo.findAllByCreatorProfileId(profileId)
  }

  async createSchedule(userId: string, dto: CreateScheduleDto) {
    const profileId = await this.resolveProfileId(userId)
    const id = await this.schedulesRepo.create({
      creatorProfileId: profileId,
      name: dto.name,
      timezone: dto.timezone,
      isDefault: dto.isDefault,
    })
    return this.schedulesRepo.findByIdWithDetails(id)
  }

  async getSchedule(id: string, userId: string) {
    await this.assertOwnsSchedule(id, userId)
    return this.schedulesRepo.findByIdWithDetails(id)
  }

  async updateSchedule(id: string, userId: string, dto: UpdateScheduleDto) {
    await this.assertOwnsSchedule(id, userId)
    await this.schedulesRepo.update(id, dto)
    return this.schedulesRepo.findByIdWithDetails(id)
  }

  async deleteSchedule(id: string, userId: string) {
    await this.assertOwnsSchedule(id, userId)
    await this.schedulesRepo.delete(id)
    return { success: true }
  }

  // ── Rules ───────────────────────────────────────────────────────────────────

  async addRule(scheduleId: string, userId: string, dto: AddRuleDto) {
    await this.assertOwnsSchedule(scheduleId, userId)
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException('startTime must be before endTime')
    }
    const ruleId = await this.schedulesRepo.addRule(scheduleId, dto)
    return this.schedulesRepo.findByIdWithDetails(scheduleId).then((s) => ({
      scheduleId,
      rule: s?.rules.find((r) => r.id === ruleId),
    }))
  }

  async updateRule(scheduleId: string, ruleId: string, userId: string, dto: UpdateRuleDto) {
    await this.assertOwnsSchedule(scheduleId, userId)
    const rule = await this.schedulesRepo.findRuleById(ruleId)
    if (!rule || rule.scheduleId !== scheduleId) throw new NotFoundException('Rule not found')

    const newStart = dto.startTime ?? rule.startTime
    const newEnd = dto.endTime ?? rule.endTime
    if (newStart >= newEnd) throw new BadRequestException('startTime must be before endTime')

    await this.schedulesRepo.updateRule(ruleId, dto)
    return this.schedulesRepo.findRuleById(ruleId)
  }

  async deleteRule(scheduleId: string, ruleId: string, userId: string) {
    await this.assertOwnsSchedule(scheduleId, userId)
    const rule = await this.schedulesRepo.findRuleById(ruleId)
    if (!rule || rule.scheduleId !== scheduleId) throw new NotFoundException('Rule not found')
    await this.schedulesRepo.deleteRule(ruleId)
    return { success: true }
  }

  // ── Overrides ───────────────────────────────────────────────────────────────

  async addOverride(scheduleId: string, userId: string, dto: AddOverrideDto) {
    await this.assertOwnsSchedule(scheduleId, userId)
    if (dto.type === 'custom') {
      if (!dto.startTime || !dto.endTime) {
        throw new BadRequestException('startTime and endTime required for custom override')
      }
      if (dto.startTime >= dto.endTime) {
        throw new BadRequestException('startTime must be before endTime')
      }
    }
    const id = await this.schedulesRepo.addOverride(scheduleId, dto)
    return this.schedulesRepo.findOverrideById(id)
  }

  async deleteOverride(scheduleId: string, overrideId: string, userId: string) {
    await this.assertOwnsSchedule(scheduleId, userId)
    const override = await this.schedulesRepo.findOverrideById(overrideId)
    if (!override || override.scheduleId !== scheduleId) {
      throw new NotFoundException('Override not found')
    }
    await this.schedulesRepo.deleteOverride(overrideId)
    return { success: true }
  }
}
