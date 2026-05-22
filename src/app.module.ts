// ─── Root Module ─────────────────────────────────────────────────────────────
// AppModule is the top-level module that wires the entire application together.
// Every feature module (Auth, Database, Users) is imported here so NestJS
// knows about all controllers, services, and providers in the app.
// Think of it as the "main switchboard" that connects all the parts.

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    // ConfigModule loads .env variables and makes them available everywhere
    // via NestJS's ConfigService. isGlobal: true means you don't need to
    // import ConfigModule again in child modules.
    ConfigModule.forRoot({ isGlobal: true }),

    // DatabaseModule sets up the Drizzle ORM connection to Neon (Postgres).
    // It is marked @Global() so any module can inject the database without
    // explicitly importing DatabaseModule.
    DatabaseModule,

    // AuthModule registers the ClerkAuthGuard, which protects routes by
    // verifying Clerk JWT tokens on every guarded request.
    AuthModule,

    // UsersModule handles all user-related routes and business logic,
    // including the Clerk webhook receiver that keeps our DB in sync.
    UsersModule,
  ],
  controllers: [AppController], // The root health-check / "Hello World" controller
  providers: [AppService],
})
export class AppModule { }
