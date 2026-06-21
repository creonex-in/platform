import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { webhookEvents } from '../database/schema'
import { generateId } from '../utils/id'

@Injectable()
export class WebhookEventsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findEvent(eventId: string) {
    return this.db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  async insertEvent(data: { eventId: string; eventType: string }): Promise<void> {
    await this.db
      .insert(webhookEvents)
      .values({ id: generateId(), ...data })
      .onConflictDoNothing({ target: webhookEvents.eventId })
  }
}
