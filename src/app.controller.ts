// Root controller — handles requests at the base URL "/".
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Returns a greeting string — useful as a health-check for the server.
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
