import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = readFileSync(resolve(__dirname, '../.env'), 'utf8')
  .split('\n')
  .filter(l => l && !l.startsWith('#'))
  .reduce((acc, l) => {
    const [k, ...v] = l.split('=')
    acc[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '')
    return acc
  }, {})

const sql = neon(env.DATABASE_URL)

console.log('Dropping all tables...')

// Drop everything — cascade handles FK order
await sql`
  DO $$ DECLARE
    r RECORD;
  BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
      EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
  END $$;
`

// Drop all enums
await sql`
  DO $$ DECLARE
    r RECORD;
  BEGIN
    FOR r IN (SELECT typname FROM pg_type JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace WHERE pg_namespace.nspname = 'public' AND pg_type.typtype = 'e') LOOP
      EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
  END $$;
`

console.log('Database wiped. Run pnpm run db:push to recreate schema.')
