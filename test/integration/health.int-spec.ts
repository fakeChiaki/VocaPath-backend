import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { closeTestApp, createTestApp } from '../support/app.js';

describe('Aplicación (integración)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  it('GET / es público', async () => {
    await request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });

  it('las rutas protegidas exigen sesión', async () => {
    await request(app.getHttpServer()).get('/careers').expect(401);
  });
});
