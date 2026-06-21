import { MiddlewareConsumer, Module, NestModule, OnApplicationShutdown, Logger } from '@nestjs/common'
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
import { RequestIdMiddleware } from './utils/request-id.middleware'
import { RequestLoggerMiddleware } from './utils/request-logger.middleware'
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
          // Browser auth traffic is same-origin: the web app proxies
          // /api/auth/* to this API via Next rewrites (next.config.ts), so the
          // auth cookies are FIRST-PARTY to the web origin. BETTER_AUTH_URL must
          // therefore be the web origin so Google's OAuth redirect_uri also goes
          // through the proxy and the state cookie is present at the callback.
          // SameSite=Lax (better-auth default) is correct; no cross-site cookies.
          //
          // COOKIE_DOMAIN is only for the shared-parent-domain setup
          // (creonex.in + api.creonex.in): it scopes the cookie to the parent so
          // both subdomains see it. Leave unset for the proxy setup above.
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
    SearchModule,
    ExploreModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule, OnApplicationShutdown {
  private readonly logger = new Logger(AppModule.name)

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestIdMiddleware, RequestLoggerMiddleware)
      .forRoutes('*')
  }

  onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutdown signal received: ${signal ?? 'unknown'} — draining connections`)
  }
}
