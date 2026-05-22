// ─── App Controller Unit Tests ────────────────────────────────────────────────
// Unit tests for AppController using NestJS's built-in testing utilities.
//
// These tests are "unit" tests because they instantiate only the pieces
// under test (AppController + AppService) — no HTTP server, no database.
// NestJS's Test.createTestingModule() compiles a mini DI container just
// for this test file.
//
// Run all tests: npm run test
// Run with coverage: npm run test:cov

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  // beforeEach runs before every individual test (it/test block).
  // It recreates a fresh module so tests are isolated from each other.
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    // app.get<T>() retrieves a provider from the test DI container —
    // same pattern as injecting in production code.
    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    // Verifies the health-check endpoint returns the expected greeting.
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
