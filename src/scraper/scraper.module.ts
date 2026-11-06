import { Module } from '@nestjs/common';
import { DemreOfferScraper } from './demre/demre-offer.scraper.js';

@Module({
  providers: [DemreOfferScraper],
  exports: [DemreOfferScraper],
})
export class ScraperModule {}
