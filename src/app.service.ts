// ─── App Service ─────────────────────────────────────────────────────────────
// Services contain the business logic for a module.
// Controllers call services; services do the actual work (DB queries, calculations, etc.).
// This root-level service is minimal — it just returns a greeting string
// used by the health-check endpoint.

import { Injectable } from '@nestjs/common';

// @Injectable() marks this class as a NestJS provider that can be
// injected into controllers or other services via the DI container.
@Injectable()
export class AppService {
  // Returns the greeting string rendered by the root GET "/" endpoint.
  getHello(): string {
    return 'Hello World!';
  }
}
