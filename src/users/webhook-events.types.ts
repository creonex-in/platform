export interface ClerkPublicMetadata {
  roles: ('learner' | 'creator')[]
  onboarding_complete: boolean
  onboarding_step: number
  intent?: 'creator' | 'learner'
}

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
  public_metadata?: ClerkPublicMetadata;
  unsafe_metadata?: Record<string, unknown>;
}

export interface ClerkDeletedData {
  id: string;
  deleted: boolean;
}

export type ClerkWebhookEvent =
  | { type: 'user.created'; data: ClerkUserData }
  | { type: 'user.updated'; data: ClerkUserData }
  | { type: 'user.deleted'; data: ClerkDeletedData };
