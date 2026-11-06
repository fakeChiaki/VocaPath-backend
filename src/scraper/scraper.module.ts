import { Module } from '@nestjs/common';
import { DemreOfferScraper } from './demre/demre-offer.scraper.js';
import { UfroCareerScraper } from './ufro/ufro-career.scraper.js';
import { UmayorCareerScraper } from './umayor/umayor-career.scraper.js';

@Module({
  providers: [DemreOfferScraper, UfroCareerScraper, UmayorCareerScraper],
  exports: [DemreOfferScraper, UfroCareerScraper, UmayorCareerScraper],
})
export class ScraperModule {}
