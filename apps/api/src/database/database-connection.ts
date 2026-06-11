import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION'

export type Database = ReturnType<typeof drizzle<typeof schema>>

export function createDatabaseConnection(connectionString: string): Database {
  const sql = neon(connectionString)
  return drizzle(sql, { schema })
}
