import './env.js';
import { AfterAll, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { setup as migrateTestDatabase } from '../../test/support/global-setup.js';
import { resetDatabase } from '../../test/support/db.js';
import { openTestDb, seedCatalog } from '../../test/support/factories.js';
import type { VocaPathWorld } from './world.js';

setDefaultTimeout(30_000);

let app: INestApplication;

// El glue ejecuta la API compilada (dist): tsx no emite los metadatos de decoradores que necesita la inyección de Nest.
BeforeAll(async () => {
  await migrateTestDatabase();
  const { AppModule } = await import('../../dist/app.module.js');
  const { configureApp } = await import('../../dist/app.setup.js');
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  configureApp(app);
  await app.init();
});

Before(async function (this: VocaPathWorld) {
  await resetDatabase();
  const { db, close } = openTestDb();
  await seedCatalog(db);
  await close();
  this.start(app);
});

AfterAll(async () => {
  const { DRIZZLE_CLIENT } = await import('../../dist/database/database.constants.js');
  const db = app.get(DRIZZLE_CLIENT) as { $client: { end: () => Promise<void> } };
  await app.close();
  await db.$client.end();
});
