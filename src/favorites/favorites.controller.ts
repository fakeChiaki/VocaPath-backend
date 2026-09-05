import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.interface.js';
import { FavoritesService } from './favorites.service.js';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.favoritesService.findAll(user.id);
  }

  @Post(':careerId')
  @HttpCode(HttpStatus.CREATED)
  add(@CurrentUser() user: AuthenticatedUser, @Param('careerId', ParseUUIDPipe) careerId: string) {
    return this.favoritesService.add(user.id, careerId);
  }

  @Delete(':careerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: AuthenticatedUser, @Param('careerId', ParseUUIDPipe) careerId: string) {
    return this.favoritesService.remove(user.id, careerId);
  }
}
