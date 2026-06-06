// Database module — creates the Drizzle ORM connection to Neon (serverless Postgres)
// and exposes it globally under the 'DATABASE' injection token.
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import * as schema from './schema';

// neon-serverless uses a WebSocket-backed Pool, which supports interactive
// multi-statement transactions (db.transaction → BEGIN/COMMIT/ROLLBACK).
// The neon-http driver does NOT support transactions. Node has no native
// WebSocket, so wire in the 'ws' implementation.
neonConfig.webSocketConstructor = ws;

@Global() // available in every module without re-importing DatabaseModule
@Module({
  providers: [
    {
      provide: 'DATABASE',
      inject: [ConfigService],
      // Returns a Drizzle instance backed by a Neon Pool (WebSocket) — required
      // for db.transaction() support.
      // Use the DIRECT (non-pooler) endpoint so multi-statement transactions
      // commit/roll back reliably. Falls back to DATABASE_URL if unset.
      useFactory: (config: ConfigService) => {
        const connectionString =
          config.get<string>('DATABASE_DIRECT_URL') ??
          config.getOrThrow<string>('DATABASE_URL');
        const pool = new Pool({ connectionString });
        return drizzle(pool, { schema });
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}
