import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const sql = neon(config.getOrThrow<string>('DATABASE_URL'));
        return drizzle(sql, { schema });
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule {}
