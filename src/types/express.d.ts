// ─── Express Type Augmentation ────────────────────────────────────────────────
// TypeScript declaration merging: extends Express's built-in Request interface
// with extra properties that our middleware/guards attach at runtime.
//
// Without this file, TypeScript would complain "Property 'auth' does not exist
// on type 'Request'" whenever we read req.auth or req.rawBody.
//
// NestJS reads rawBody as a Buffer when rawBody: true is set in NestFactory.create().
// ClerkAuthGuard attaches the auth object after verifying the JWT.

declare namespace Express {
  interface Request {
    // Populated by ClerkAuthGuard after a valid Clerk JWT is verified.
    // undefined on unauthenticated / unguarded routes.
    auth?: {
      clerkUserId: string; // Clerk user ID (e.g. "user_2abc...")
      sessionId: string;   // Clerk session ID, useful for revocation checks
    };

    // The raw, unparsed request body as a Buffer.
    // Set by NestJS when rawBody: true is passed to NestFactory.create().
    // Required by Svix to verify webhook signature integrity.
    rawBody?: Buffer;
  }
}
