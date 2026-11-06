import { Module } from '@nestjs/common';
import { DemreOfferScraper } from './demre/demre-offer.scraper.js';
import { UfroCareerScraper } from './ufro/ufro-career.scraper.js';

@Module({
  providers: [DemreOfferScraper, UfroCareerScraper],
  exports: [DemreOfferScraper, UfroCareerScraper],
})
export class ScraperModule {}
