// Receives and processes Clerk webhook events sent via Svix.
// Every incoming request is signature-verified before any data is processed.
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

  // Verifies the Svix signature, then syncs the user record based on the event type.
  @Post('clerk')
  @HttpCode(200) // Svix retries delivery on anything other than 2xx
  async handleClerkWebhook(
    @RawBody() rawBody: Buffer | undefined,           // raw bytes needed for signature verification
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
      // Throws if the signature doesn't match — rejects tampered or forged payloads
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

        // Use the primary email; fall back to the first in the list if primary is unset
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
