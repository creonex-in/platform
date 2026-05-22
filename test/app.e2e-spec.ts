// ─── End-to-End (E2E) Tests ───────────────────────────────────────────────────
// E2E tests spin up the full NestJS application (just like production) and
// send real HTTP requests against it using Supertest.
//
// Unlike unit tests, E2E tests exercise the entire request pipeline:
// middleware → guards → controllers → services → (mocked) database.
// This catches wiring mistakes that unit tests miss.
//
// Run: npm run test:e2e

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  // Before each test, create and initialize a full NestJS app instance.
  // Note: this imports AppModule — so real database connections and guards
  // are active. For a production test suite, you'd mock the DATABASE provider.
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init(); // boots the app (runs onModuleInit hooks, etc.)
  });

  // Verify the root health-check route is reachable and returns the greeting.
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // After each test, shut the app down cleanly to free ports and DB connections.
  afterEach(async () => {
    await app.close();
  });
});
