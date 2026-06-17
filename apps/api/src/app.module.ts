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
import { PaymentModule } from './payment/payment.module'
import { BookingsModule } from './bookings/bookings.module'
import { TestimonialsModule } from './testimonials/testimonials.module'
import { UploadsModule } from './uploads/uploads.module'
import { PayoutsModule } from './payouts/payouts.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { LearnerModule } from './learner/learner.module'
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
          // Shared-domain prod: web (creonex.in) and api (api.creonex.in) sit on
          // the same parent domain, so the session cookie is scoped to that
          // parent (e.g. ".creonex.in") and sent on both. SameSite=Lax is enough
          // — no third-party-cookie risk. Set COOKIE_DOMAIN to the leading-dot
          // parent. Gated to prod; dev stays on plain localhost cookies.
          ...(config.get<string>('NODE_ENV') === 'production' &&
          config.get<string>('COOKIE_DOMAIN')
            ? {
                advanced: {
                  crossSubDomainCookies: {
                    enabled: true,
                    domain: config.get<string>('COOKIE_DOMAIN'),
                  },
                },
              }
            : {}),
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
    PaymentModule,
    BookingsModule,
    TestimonialsModule,
    UploadsModule,
    PayoutsModule,
    DashboardModule,
    LearnerModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
