import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthGuard } from './clerk.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [ConfigModule, UsersModule],
  providers: [ClerkAuthGuard],
  exports: [ClerkAuthGuard],
})
export class AuthModule { }