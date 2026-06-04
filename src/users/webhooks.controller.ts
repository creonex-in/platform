import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Inject,
  Post,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClerkClient } from '@clerk/backend'
import { Webhook } from 'svix'
import { RawBody } from '../auth/get-auth.decorator'
import { ClerkWebhookEvent } from './webhook-events.types'
import { UsersService } from './users.service'

type ClerkClient = ReturnType<typeof createClerkClient>

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    @Inject('CLERK_CLIENT') private readonly clerkClient: ClerkClient,
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
      throw new BadRequestException('Missing svix headers')
    }
    if (!rawBody) {
      throw new BadRequestException('Missing raw body')
    }

    const secret = this.config.getOrThrow<string>('CLERK_WEBHOOK_SECRET')
    const wh = new Webhook(secret)

    let event: ClerkWebhookEvent
    try {
      event = wh.verify(rawBody.toString(), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent
    } catch {
      throw new BadRequestException('Invalid webhook signature')
    }

    switch (event.type) {
      case 'user.created': {
        const { data } = event
        const primaryEmail =
          data.email_addresses.find(
            (e) => e.id === data.primary_email_address_id,
          )?.email_address ?? data.email_addresses[0]?.email_address

        if (!primaryEmail) break

        // Read intent set by frontend during Clerk signup
        const intent = data.unsafe_metadata?.intent as
          | 'creator'
          | 'learner'
          | undefined

        const roles: ('learner' | 'creator')[] =
          intent === 'creator' ? ['learner', 'creator'] : ['learner']

        // Step 1 — Update Clerk publicMetadata (Clerk is authority)
        await this.clerkClient.users.updateUserMetadata(data.id, {
          publicMetadata: {
            roles,
            onboarding_complete: false,
            onboarding_step: 1,
          },
        })

        // Step 2 — Mirror to DB
        await this.usersService.upsertFromClerk({
          clerkId: data.id,
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          roles,
          onboardingComplete: false,
          onboardingStep: 1,
        })

        // Step 3 — Create profile records immediately
        // So onboarding endpoints always have a record to update
        const user = await this.usersService.getByClerkId(data.id)
        if (user) {
          if (roles.includes('creator')) {
            await this.usersService.createCreatorProfile(user.id)
          }
          await this.usersService.createLearnerProfile(user.id)
        }

        break
      }

      case 'user.updated': {
        const { data } = event
        const primaryEmail =
          data.email_addresses.find(
            (e) => e.id === data.primary_email_address_id,
          )?.email_address ?? data.email_addresses[0]?.email_address

        if (!primaryEmail) break

        // Only sync identity fields — never touch roles here
        await this.usersService.upsertFromClerk({
          clerkId: data.id,
          email: primaryEmail,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
        })
        break
      }

      case 'user.deleted': {
        if (event.data.id) {
          await this.usersService.deleteByClerkId(event.data.id)
        }
        break
      }
    }

    return { received: true }
  }
}