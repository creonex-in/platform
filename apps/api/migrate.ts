import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

async function main() {
  const url = process.env['DATABASE_DIRECT_URL'] ?? process.env['DATABASE_URL']
  if (!url) throw new Error('DATABASE_URL not set')

  const sql = neon(url)
  const db = drizzle(sql)

  await migrate(db, { migrationsFolder: './drizzle' })
  console.log('Migrations applied.')
}

main().catch((e) => { console.error(e); process.exit(1) })
