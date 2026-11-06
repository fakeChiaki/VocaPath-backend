import { Module } from '@nestjs/common';
import { DemreOfferScraper } from './demre/demre-offer.scraper.js';
import { UctCareerScraper } from './uct/uct-career.scraper.js';
import { UautonomaCareerScraper } from './uautonoma/uautonoma-career.scraper.js';
import { UfroCareerScraper } from './ufro/ufro-career.scraper.js';
import { UmayorCareerScraper } from './umayor/umayor-career.scraper.js';
import { UstCareerScraper } from './ust/ust-career.scraper.js';

@Module({
  providers: [DemreOfferScraper, UfroCareerScraper, UctCareerScraper, UautonomaCareerScraper, UmayorCareerScraper, UstCareerScraper],
  exports: [DemreOfferScraper, UfroCareerScraper, UctCareerScraper, UautonomaCareerScraper, UmayorCareerScraper, UstCareerScraper],
})
export class ScraperModule {}
