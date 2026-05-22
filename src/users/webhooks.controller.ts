import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Webhook } from 'svix';
import { RawBody } from '../auth/get-auth.decorator';
import { ClerkWebhookEvent } from './webhook-events.types';
import { UsersService } from './users.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Post('clerk')
  @HttpCode(200)
  async handleClerkWebhook(
    @RawBody() rawBody: Buffer | undefined,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ): Promise<{ received: boolean }> {
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing svix headers');
    }

    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    const secret = this.config.getOrThrow<string>('CLERK_WEBHOOK_SECRET');
    const wh = new Webhook(secret);

    let event: ClerkWebhookEvent;
    try {
      event = wh.verify(rawBody.toString(), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const { data } = event;
        const primaryEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id,
        )?.email_address ?? data.email_addresses[0]?.email_address;

        if (!primaryEmail) break;

        await this.usersService.upsertFromClerk({
          clerkId: data.id,
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
        });
        break;
      }

      case 'user.deleted': {
        if (event.data.id) {
          await this.usersService.deleteByClerkId(event.data.id);
        }
        break;
      }
    }

    return { received: true };
  }
}
