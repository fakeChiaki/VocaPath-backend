import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { TEST_DATABASE_URL } from './test/support/env.js';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/database/migrations/**', 'src/database/schema/**', 'src/main.ts', 'src/scraper/run.ts'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.spec.ts', 'test/support/**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['test/integration/**/*.int-spec.ts'],
          globalSetup: ['test/support/global-setup.ts'],
          fileParallelism: false,
          testTimeout: 30_000,
          hookTimeout: 60_000,
          env: {
            DATABASE_URL: TEST_DATABASE_URL,
            JWT_SECRET: 'test-secret-with-at-least-32-characters',
            JWT_ACCESS_EXPIRES_IN: '15m',
            REFRESH_TOKEN_EXPIRES_IN_DAYS: '7',
            FRONTEND_URL: 'http://localhost:5173',
          },
        },
      },
    ],
  },
});
