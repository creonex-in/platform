// ─── Database Module ──────────────────────────────────────────────────────────
// This module creates and exports the single database connection used across
// the whole application.
//
// Stack:
//  - Neon   → serverless Postgres host (connection via HTTP, not TCP)
//  - Drizzle ORM → type-safe query builder (similar to Prisma but lighter)
//
// The database instance is provided under the string token 'DATABASE'.
// Inject it in any repository like:
//   constructor(@Inject('DATABASE') private readonly db: DB) {}
//
// @Global() means other modules can inject 'DATABASE' without importing
// DatabaseModule themselves — it's available app-wide after AppModule loads it.

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

@Global() // register once, available everywhere — no repeated imports needed
@Module({
  providers: [
    {
      provide: 'DATABASE', // the injection token other classes use to receive the DB
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // neon() returns a Neon SQL executor that speaks HTTP/2 instead of
        // a persistent TCP socket — this works well in serverless environments.
        const sql = neon(config.getOrThrow<string>('DATABASE_URL'));

        // drizzle() wraps the Neon executor and adds the query-builder API.
        // Passing the schema object gives Drizzle full type information so
        // queries are type-checked at compile time.
        return drizzle(sql, { schema });
      },
    },
  ],
  exports: ['DATABASE'], // make the DB injectable in any module
})
export class DatabaseModule {}
