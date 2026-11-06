import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { DemreOfferScraper } from './demre/demre-offer.scraper.js';
import { UctCareerScraper } from './uct/uct-career.scraper.js';
import { UautonomaCareerScraper } from './uautonoma/uautonoma-career.scraper.js';
import { UfroCareerScraper } from './ufro/ufro-career.scraper.js';
import { UmayorCareerScraper } from './umayor/umayor-career.scraper.js';
import { UstCareerScraper } from './ust/ust-career.scraper.js';

const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'warn', 'error'] });
let exitCode = 0;
try {
  await app.get(DemreOfferScraper).run();
  await app.get(UfroCareerScraper).run();
  await app.get(UctCareerScraper).run();
  await app.get(UautonomaCareerScraper).run();
  await app.get(UmayorCareerScraper).run();
  await app.get(UstCareerScraper).run();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  exitCode = 1;
} finally {
  await app.close();
}
process.exit(exitCode);
