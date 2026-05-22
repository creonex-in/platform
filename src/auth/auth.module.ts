// Auth module — registers and exports ClerkAuthGuard for use across the app.
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClerkAuthGuard } from './clerk.guard';

@Module({
  imports: [ConfigModule],
  providers: [ClerkAuthGuard],
  exports: [ClerkAuthGuard],
})
export class AuthModule {}
