import { Injectable, Inject } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { DATABASE_CONNECTION, type Database } from '../database/database-connection'
import { calendarConnections } from '../database/schema'
import { encryptToken, decryptToken } from './calendar.crypto'

export interface CalendarConnectionRow {
  id: string
  creatorProfileId: string
  provider: string
  accountEmail: string | null
  accessToken: string | null   // decrypted
  refreshToken: string | null  // decrypted
  tokenExpiresAt: Date | null
  calendarId: string
  syncEnabled: boolean
}

@Injectable()
export class CalendarConnectionsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async findByCreatorAndProvider(
    creatorProfileId: string,
    provider: string,
  ): Promise<CalendarConnectionRow | null> {
    const rows = await this.db
      .select()
      .from(calendarConnections)
      .where(
        and(
          eq(calendarConnections.creatorProfileId, creatorProfileId),
          eq(calendarConnections.provider, provider),
        ),
      )
      .limit(1)

    const row = rows[0]
    if (!row) return null
    return this.decrypt(row)
  }

  async upsert(data: {
    creatorProfileId: string
    provider: string
    accountEmail?: string
    accessToken: string
    refreshToken?: string
    tokenExpiresAt: Date
    calendarId?: string
  }): Promise<void> {
    const encAccess = encryptToken(data.accessToken)
    const encRefresh = data.refreshToken ? encryptToken(data.refreshToken) : undefined

    await this.db
      .insert(calendarConnections)
      .values({
        id: crypto.randomUUID(),
        creatorProfileId: data.creatorProfileId,
        provider: data.provider,
        accountEmail: data.accountEmail ?? null,
        accessToken: encAccess,
        refreshToken: encRefresh ?? null,
        tokenExpiresAt: data.tokenExpiresAt,
        calendarId: data.calendarId ?? 'primary',
      })
      .onConflictDoUpdate({
        target: [calendarConnections.creatorProfileId, calendarConnections.provider],
        set: {
          accountEmail: data.accountEmail ?? null,
          accessToken: encAccess,
          ...(encRefresh ? { refreshToken: encRefresh } : {}),
          tokenExpiresAt: data.tokenExpiresAt,
          updatedAt: new Date(),
        },
      })
  }

  async updateAccessToken(
    creatorProfileId: string,
    provider: string,
    accessToken: string,
    tokenExpiresAt: Date,
  ): Promise<void> {
    await this.db
      .update(calendarConnections)
      .set({ accessToken: encryptToken(accessToken), tokenExpiresAt, updatedAt: new Date() })
      .where(
        and(
          eq(calendarConnections.creatorProfileId, creatorProfileId),
          eq(calendarConnections.provider, provider),
        ),
      )
  }

  async delete(creatorProfileId: string, provider: string): Promise<void> {
    await this.db
      .delete(calendarConnections)
      .where(
        and(
          eq(calendarConnections.creatorProfileId, creatorProfileId),
          eq(calendarConnections.provider, provider),
        ),
      )
  }

  private decrypt(row: typeof calendarConnections.$inferSelect): CalendarConnectionRow {
    return {
      id: row.id,
      creatorProfileId: row.creatorProfileId,
      provider: row.provider,
      accountEmail: row.accountEmail,
      accessToken: row.accessToken ? decryptToken(row.accessToken) : null,
      refreshToken: row.refreshToken ? decryptToken(row.refreshToken) : null,
      tokenExpiresAt: row.tokenExpiresAt,
      calendarId: row.calendarId,
      syncEnabled: row.syncEnabled,
    }
  }
}
