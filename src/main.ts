import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { assertSafeJwtSecret, configureApp } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  assertSafeJwtSecret(app.get(ConfigService).get<string>('JWT_SECRET'));
  configureApp(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
