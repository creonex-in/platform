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
import { SearchModule } from './search/search.module'
import { ExploreModule } from './explore/explore.module'
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
          // Prod cookie scoping. Two modes, gated to prod (dev stays on plain
          // localhost cookies):
          //   - COOKIE_DOMAIN set  -> web + api share a parent domain
          //     (e.g. creonex.in + api.creonex.in). Cookie scoped to the
          //     leading-dot parent, SameSite=Lax is enough, no third-party risk.
          //   - COOKIE_DOMAIN unset -> web + api are on different sites
          //     (e.g. *.vercel.app + *.railway.app). The auth cookies are
          //     third-party, so they MUST be SameSite=None; Secure or the
          //     browser drops them -> OAuth state_mismatch. Requires the API to
          //     trust the proxy (see main.ts) so Secure cookies are honored.
          ...(config.get<string>('NODE_ENV') === 'production'
            ? {
                advanced: config.get<string>('COOKIE_DOMAIN')
                  ? {
                      crossSubDomainCookies: {
                        enabled: true,
                        domain: config.get<string>('COOKIE_DOMAIN'),
                      },
                      defaultCookieAttributes: { sameSite: 'lax', secure: true },
                    }
                  : {
                      defaultCookieAttributes: { sameSite: 'none', secure: true },
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
    SearchModule,
    ExploreModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
