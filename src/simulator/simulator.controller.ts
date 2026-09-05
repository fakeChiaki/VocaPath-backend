import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.interface.js';
import { SimulatorService } from './simulator.service.js';

@Controller('simulator')
export class SimulatorController {
  constructor(private readonly simulatorService: SimulatorService) {}

  @Get(':careerId')
  simulate(@CurrentUser() user: AuthenticatedUser, @Param('careerId', ParseUUIDPipe) careerId: string) {
    return this.simulatorService.simulate(user.id, careerId);
  }
}
