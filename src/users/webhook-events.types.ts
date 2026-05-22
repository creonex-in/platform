export interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

export interface ClerkUserData {
  id: string;
  email_addresses: ClerkEmailAddress[];
  primary_email_address_id: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
}

export interface ClerkDeletedData {
  id: string;
  deleted: boolean;
}

export type ClerkWebhookEvent =
  | { type: 'user.created'; data: ClerkUserData }
  | { type: 'user.updated'; data: ClerkUserData }
  | { type: 'user.deleted'; data: ClerkDeletedData };
