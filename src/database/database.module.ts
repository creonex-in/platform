// Database module — creates the Drizzle ORM connection to Neon (serverless Postgres)
// and exposes it globally under the 'DATABASE' injection token.
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

@Global() // available in every module without re-importing DatabaseModule
@Module({
  providers: [
    {
      provide: 'DATABASE',
      inject: [ConfigService],
      // Returns a Drizzle instance connected to Neon via HTTP (no persistent TCP socket)
      useFactory: (config: ConfigService) => {
        const sql = neon(config.getOrThrow<string>('DATABASE_URL'));
        return drizzle(sql, { schema });
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}
