import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DRIZZLE_CLIENT } from './database.constants.js';
import * as schema from './schema/index.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DRIZZLE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const connectionString = configService.getOrThrow<string>('DATABASE_URL');
        const client = postgres(connectionString);
        return drizzle(client, { schema });
      },
    },
  ],
  exports: [DRIZZLE_CLIENT],
})
export class DatabaseModule {}
