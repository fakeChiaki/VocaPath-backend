import { Module } from '@nestjs/common';
import { DemreOfferScraper } from './demre/demre-offer.scraper.js';
import { UctCareerScraper } from './uct/uct-career.scraper.js';
import { UfroCareerScraper } from './ufro/ufro-career.scraper.js';
import { UmayorCareerScraper } from './umayor/umayor-career.scraper.js';

@Module({
  providers: [DemreOfferScraper, UfroCareerScraper, UctCareerScraper, UmayorCareerScraper],
  exports: [DemreOfferScraper, UfroCareerScraper, UctCareerScraper, UmayorCareerScraper],
})
export class ScraperModule {}
