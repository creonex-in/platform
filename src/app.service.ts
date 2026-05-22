// Root service — provides the logic for the base health-check endpoint.
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Returns the greeting string used by the GET "/" health-check route.
  getHello(): string {
    return 'Hello World!';
  }
}
