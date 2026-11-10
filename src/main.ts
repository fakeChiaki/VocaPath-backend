import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const secret = app.get(ConfigService).get<string>('JWT_SECRET');
  if (process.env.NODE_ENV === 'production' && (!secret || secret === 'change-me' || secret.length < 32)) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres y no puede ser el valor de ejemplo en producción');
  }
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
