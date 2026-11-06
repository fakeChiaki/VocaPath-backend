import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { ScraperRunner } from './scraper-runner.service.js';

const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'warn', 'error'] });
let exitCode = 0;
try {
  if ((await app.get(ScraperRunner).runAll()) > 0) exitCode = 1;
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  exitCode = 1;
} finally {
  await app.close();
}
process.exit(exitCode);
