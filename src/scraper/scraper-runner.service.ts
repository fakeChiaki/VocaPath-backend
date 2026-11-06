import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DemreCalendarScraper } from './demre/demre-calendar.scraper.js';
import { DemreOfferScraper } from './demre/demre-offer.scraper.js';
import { UautonomaCareerScraper } from './uautonoma/uautonoma-career.scraper.js';
import { UctCareerScraper } from './uct/uct-career.scraper.js';
import { UfroCareerScraper } from './ufro/ufro-career.scraper.js';
import { UmayorCareerScraper } from './umayor/umayor-career.scraper.js';
import { UstCareerScraper } from './ust/ust-career.scraper.js';

@Injectable()
export class ScraperRunner {
  private readonly logger = new Logger(ScraperRunner.name);
  private running = false;

  constructor(
    private readonly demreCalendar: DemreCalendarScraper,
    private readonly demre: DemreOfferScraper,
    private readonly ufro: UfroCareerScraper,
    private readonly uct: UctCareerScraper,
    private readonly uautonoma: UautonomaCareerScraper,
    private readonly umayor: UmayorCareerScraper,
    private readonly ust: UstCareerScraper,
  ) {}

  @Cron('0 3 * * 1', { timeZone: 'America/Santiago' })
  async runWeekly() {
    await this.runAll();
  }

  async runAll() {
    if (this.running) {
      this.logger.warn('Ya hay un scraping en curso; se omite esta ejecución');
      return 0;
    }
    this.running = true;
    let failures = 0;
    try {
      for (const scraper of [this.demreCalendar, this.demre, this.ufro, this.uct, this.uautonoma, this.umayor, this.ust]) {
        try {
          await scraper.run();
        } catch (error) {
          failures++;
          this.logger.error(`${scraper.constructor.name} falló: ${error instanceof Error ? error.message : error}`);
        }
      }
    } finally {
      this.running = false;
    }
    return failures;
  }
}
