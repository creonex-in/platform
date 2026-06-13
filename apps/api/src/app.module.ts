import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '@mguay/nestjs-better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { AppController } from './app.controller'
import { DatabaseModule } from './database/database.module'
import { UsersModule } from './users/users.module'
import { OnboardingModule } from './onboarding/onboarding.module'
import { CreatorsModule } from './creators/creators.module'
import { OfferingsModule } from './offerings/offerings.module'
import { AvailabilityModule } from './availability/availability.module'
import { CalendarModule } from './calendar/calendar.module'
import { MeetingModule } from './meeting/meeting.module'
import { DATABASE_CONNECTION, type Database } from './database/database-connection'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule.forRootAsync({
      inject: [DATABASE_CONNECTION, ConfigService],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: ((db: Database, config: ConfigService) => ({
        auth: betterAuth({
          database: drizzleAdapter(db, { provider: 'pg' }),
          trustedOrigins: config.get<string>('ALLOWED_ORIGINS', 'http://localhost:3001').split(','),
          emailAndPassword: { enabled: true },
          socialProviders: {
            google: {
              clientId: config.get<string>('GOOGLE_CLIENT_ID', ''),
              clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET', ''),
            },
          },
          plugins: [
            admin({
              defaultRole: 'learner',
              adminRoles: ['admin'],
            }),
          ],
          session: {
            cookieCache: { enabled: false },
          },
        }),
      })) as any,
    }),
    UsersModule,
    OnboardingModule,
    CreatorsModule,
    OfferingsModule,
    AvailabilityModule,
    CalendarModule,
    MeetingModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
