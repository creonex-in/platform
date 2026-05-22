// ─── Users Module ─────────────────────────────────────────────────────────────
// Bundles all user-related pieces — HTTP controllers, business logic, and
// database access — into one cohesive NestJS module.
//
// Layer overview:
//   UsersController    → handles REST API requests (e.g. GET /users/me)
//   WebhooksController → handles Clerk webhook POST events (user created/updated/deleted)
//   UsersService       → business logic layer, called by both controllers
//   UsersRepository    → data-access layer, speaks directly to the database
//
// UsersService is exported so other modules (e.g. a future OrdersModule) can
// look up user records without bypassing the service layer.

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [
    DatabaseModule, // provides the 'DATABASE' injection token used by UsersRepository
    AuthModule,     // provides ClerkAuthGuard used by UsersController
  ],
  controllers: [
    UsersController,    // REST endpoints under /users
    WebhooksController, // webhook endpoint under /webhooks
  ],
  providers: [
    UsersRepository, // data-access layer
    UsersService,    // business logic layer
  ],
  exports: [UsersService], // allow other modules to inject UsersService
})
export class UsersModule { }
