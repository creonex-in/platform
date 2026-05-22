// ─── Auth Module ─────────────────────────────────────────────────────────────
// This module groups everything related to authentication.
// Currently it only exposes ClerkAuthGuard, but any future auth providers,
// strategies, or decorators would also live here.
//
// By exporting ClerkAuthGuard, other modules (like UsersModule) can apply
// it to their routes without re-importing ConfigModule themselves.

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthGuard } from './clerk.guard';

@Module({
  imports: [ConfigModule], // needed so ClerkAuthGuard can read env vars via ConfigService
  providers: [ClerkAuthGuard],
  exports: [ClerkAuthGuard], // expose the guard so UsersModule can inject it
})
export class AuthModule {}
