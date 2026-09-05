import { Module } from '@nestjs/common';
import { CareersModule } from '../careers/careers.module.js';
import { FavoritesController } from './favorites.controller.js';
import { FavoritesService } from './favorites.service.js';

@Module({
  imports: [CareersModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
