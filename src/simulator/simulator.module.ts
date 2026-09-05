import { Module } from '@nestjs/common';
import { CareersModule } from '../careers/careers.module.js';
import { ScoresModule } from '../scores/scores.module.js';
import { SimulatorController } from './simulator.controller.js';
import { SimulatorService } from './simulator.service.js';

@Module({
  imports: [CareersModule, ScoresModule],
  controllers: [SimulatorController],
  providers: [SimulatorService],
})
export class SimulatorModule {}
