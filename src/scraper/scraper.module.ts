import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DemreCalendarScraper } from './demre/demre-calendar.scraper.js';
import { DemreOfferScraper } from './demre/demre-offer.scraper.js';
import { ScraperRunner } from './scraper-runner.service.js';
import { UctCareerScraper } from './uct/uct-career.scraper.js';
import { UautonomaCareerScraper } from './uautonoma/uautonoma-career.scraper.js';
import { UfroCareerScraper } from './ufro/ufro-career.scraper.js';
import { UmayorCareerScraper } from './umayor/umayor-career.scraper.js';
import { UstCareerScraper } from './ust/ust-career.scraper.js';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [DemreCalendarScraper, DemreOfferScraper, UfroCareerScraper, UctCareerScraper, UautonomaCareerScraper, UmayorCareerScraper, UstCareerScraper, ScraperRunner],
  exports: [ScraperRunner],
})
export class ScraperModule {}
