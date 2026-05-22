// ─── App Controller ───────────────────────────────────────────────────────────
// The root controller handles requests sent to the base URL ("/").
// Right now it only has a single health-check endpoint that returns
// "Hello World!" — useful to confirm the server is up and running.
// As the app grows, more global endpoints can be added here.

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// @Controller() with no path prefix means this handles requests at "/"
@Controller()
export class AppController {
  // NestJS injects AppService automatically via constructor injection.
  constructor(private readonly appService: AppService) {}

  // GET / — a simple health-check that returns a greeting string.
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
