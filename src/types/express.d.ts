// Extends Express's Request type with fields our middleware attaches at runtime.
// Without this, TypeScript would error on req.auth and req.rawBody.
declare namespace Express {
  interface Request {
    // Set by ClerkAuthGuard after a valid Clerk JWT is verified.
    auth?: {
      clerkUserId: string;
      sessionId: string;
    };
    // Preserved by NestJS when rawBody: true is passed to NestFactory.create().
    rawBody?: Buffer;
  }
}
