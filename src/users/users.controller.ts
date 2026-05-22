import {
  Controller,
  Get,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { GetClerkUserId } from '../auth/get-auth.decorator';
import { User } from './users.repository';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(ClerkAuthGuard)
  async getMe(@GetClerkUserId() clerkUserId: string): Promise<User> {
    const user = await this.usersService.getByClerkId(clerkUserId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
