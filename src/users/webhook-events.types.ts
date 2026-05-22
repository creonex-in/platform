// ─── Clerk Webhook Event Types ────────────────────────────────────────────────
// TypeScript types that describe the JSON payloads Clerk sends to our
// POST /webhooks/clerk endpoint when user-related events occur.
//
// Clerk uses Svix to deliver webhooks. The payload structure matches
// Clerk's official API documentation for user events.
//
// How these types are used:
//   1. WebhooksController receives a raw Buffer.
//   2. Svix verifies the signature, then parses the JSON into a ClerkWebhookEvent.
//   3. The discriminated union (type field) lets us switch() on the event type
//      and get full TypeScript autocomplete for each event's data shape.

// A single email address record from Clerk.
// Clerk users can have multiple email addresses; one is designated "primary".
export interface ClerkEmailAddress {
  id: string;            // Clerk's internal ID for this email address
  email_address: string; // the actual email string (e.g. "user@example.com")
}

// The full user data payload included in user.created and user.updated events.
export interface ClerkUserData {
  id: string;                              // Clerk user ID (e.g. "user_2abc...")
  email_addresses: ClerkEmailAddress[];    // all email addresses on this account
  primary_email_address_id: string | null; // points to the primary entry in email_addresses
  first_name: string | null;
  last_name: string | null;
  image_url: string;                       // profile picture URL
}

// Payload for user.deleted — only contains the ID and a deleted flag.
// Clerk omits other fields to reduce payload size on deletion events.
export interface ClerkDeletedData {
  id: string;
  deleted: boolean;
}

// Discriminated union of all supported Clerk webhook event types.
// Adding the `type` field as a string literal in each branch lets TypeScript
// narrow the type inside switch/if blocks, giving us type-safe access to `data`.
export type ClerkWebhookEvent =
  | { type: 'user.created'; data: ClerkUserData }
  | { type: 'user.updated'; data: ClerkUserData }
  | { type: 'user.deleted'; data: ClerkDeletedData };
