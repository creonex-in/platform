// TypeScript types for the JSON payloads Clerk sends to our webhook endpoint.

// A single email address entry on a Clerk user account.
export interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

// User data included in user.created and user.updated webhook events.
export interface ClerkUserData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
}

// Minimal payload sent by Clerk on user.deleted events.
export interface ClerkDeletedData {
  id: string;
  deleted: boolean;
}

// Discriminated union of all supported Clerk webhook event types.
// The `type` field lets TypeScript narrow the correct `data` shape inside a switch statement.
export type ClerkWebhookEvent =
  | { type: 'user.created'; data: ClerkUserData }
  | { type: 'user.updated'; data: ClerkUserData }
  | { type: 'user.deleted'; data: ClerkDeletedData };
