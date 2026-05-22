// Users module — groups all user-related controllers, services, and repositories.
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UsersController, WebhooksController],
  providers: [UsersRepository, UsersService],
  exports: [UsersService],
})
export class UsersModule { }
