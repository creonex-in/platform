// ─── Webhooks Controller ──────────────────────────────────────────────────────
// Receives and processes webhook events sent by Clerk via Svix.
//
// Why webhooks?
//   Clerk manages authentication (sign-up, profile updates, deletion).
//   Our database needs a copy of user data (email, name, avatar) so we can
//   join it with other app data without calling Clerk on every request.
//   Clerk pushes changes to us in real-time via webhooks whenever a user
//   is created, updated, or deleted.
//
// Security:
//   Every incoming request is verified using Svix's signature scheme.
//   Clerk signs each webhook payload with a secret (CLERK_WEBHOOK_SECRET).
//   We verify the signature before processing — unauthenticated or tampered
//   requests are rejected with 400 Bad Request.
//
// Routes:
//   POST /webhooks/clerk  → Clerk sends all user lifecycle events here

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

  // POST /webhooks/clerk
  // @HttpCode(200) ensures we always respond with 200 on success.
  // Svix retries delivery if it receives anything other than 2xx.
  @Post('clerk')
  @HttpCode(200)
  async handleClerkWebhook(
    // @RawBody() gives us the unparsed Buffer — Svix needs the raw bytes
    // to recompute the HMAC signature for verification.
    @RawBody() rawBody: Buffer | undefined,

    // Svix includes three headers that form the webhook signature.
    // svix-id        : unique event ID (used to detect duplicate deliveries)
    // svix-timestamp : Unix timestamp of delivery (prevents replay attacks)
    // svix-signature : HMAC-SHA256 signature over id + timestamp + body
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
  ): Promise<{ received: boolean }> {

    // All three Svix headers must be present — if any is missing the
    // request is malformed or not a genuine Clerk webhook.
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing svix headers');
    }

    if (!rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    // Retrieve the webhook signing secret from environment variables.
    // This is set in the Clerk dashboard under Webhooks → Signing Secret.
    const secret = this.config.getOrThrow<string>('CLERK_WEBHOOK_SECRET');
    const wh = new Webhook(secret);

    let event: ClerkWebhookEvent;
    try {
      // wh.verify() recomputes the HMAC and compares it to svix-signature.
      // Throws if the signature doesn't match — which rejects tampered payloads.
      event = wh.verify(rawBody.toString(), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Route each event type to the appropriate service method.
    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const { data } = event;

        // Clerk users can have multiple email addresses.
        // Use the one marked as primary; fall back to the first in the list
        // if primary_email_address_id is null (e.g. during account setup).
        const primaryEmail = data.email_addresses.find(
          (e) => e.id === data.primary_email_address_id,
        )?.email_address ?? data.email_addresses[0]?.email_address;

        // Skip upsert if we can't determine an email (edge case during deletion flow).
        if (!primaryEmail) break;

        // Create or update the user row in our database.
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
        // Remove the user from our database.
        // Guard against the edge case where Clerk sends a deletion event
        // without an ID (shouldn't happen, but Clerk's type says id is optional).
        if (event.data.id) {
          await this.usersService.deleteByClerkId(event.data.id);
        }
        break;
      }
    }

    // Always acknowledge receipt so Svix doesn't retry the delivery.
    return { received: true };
  }
}
