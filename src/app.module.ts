import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { UniversitiesModule } from './universities/universities.module.js';
import { CareersModule } from './careers/careers.module.js';
import { FavoritesModule } from './favorites/favorites.module.js';
import { PaesDatesModule } from './paes-dates/paes-dates.module.js';
import { ScoresModule } from './scores/scores.module.js';
import { PaesTestsModule } from './paes-tests/paes-tests.module.js';
import { VocationalTestsModule } from './vocational-tests/vocational-tests.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    UniversitiesModule,
    CareersModule,
    FavoritesModule,
    PaesDatesModule,
    ScoresModule,
    PaesTestsModule,
    VocationalTestsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
