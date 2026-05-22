declare namespace Express {
  interface Request {
    auth?: {
      clerkUserId: string;
      sessionId: string;
    };
    rawBody?: Buffer;
  }
}
