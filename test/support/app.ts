import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { DRIZZLE_CLIENT } from '../../src/database/database.constants.js';
import type { DrizzleDb } from '../../src/database/database.types.js';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
  return app;
}

export async function closeTestApp(app: INestApplication) {
  const db = app.get<DrizzleDb & { $client: { end: () => Promise<void> } }>(DRIZZLE_CLIENT);
  await app.close();
  await db.$client.end();
}
