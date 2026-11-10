import { ValidationPipe, type INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

export function assertSafeJwtSecret(secret: string | undefined, nodeEnv = process.env.NODE_ENV) {
  if (nodeEnv === 'production' && (!secret || secret === 'change-me' || secret.length < 32)) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres y no puede ser el valor de ejemplo en producción');
  }
}

export function configureApp(app: INestApplication) {
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });
}
