import { Module } from '@nestjs/common';
import { ScoresModule } from '../scores/scores.module.js';
import { PaesTestsController } from './paes-tests.controller.js';
import { PaesTestsService } from './paes-tests.service.js';

@Module({
  imports: [ScoresModule],
  controllers: [PaesTestsController],
  providers: [PaesTestsService],
})
export class PaesTestsModule {}
