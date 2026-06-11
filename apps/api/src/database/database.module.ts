import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DATABASE_CONNECTION, createDatabaseConnection } from './database-connection'

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url =
          config.get<string>('DATABASE_DIRECT_URL') ??
          config.get<string>('DATABASE_URL') ??
          ''
        return createDatabaseConnection(url)
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
