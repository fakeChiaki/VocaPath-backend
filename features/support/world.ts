// Las variables de entorno deben existir antes de cargar la aplicación compilada.
import './env.js';
import { World, setWorldConstructor, type IWorldOptions } from '@cucumber/cucumber';
import request from 'supertest';
import type { Response } from 'supertest';
import type { INestApplication } from '@nestjs/common';

type Agent = ReturnType<typeof request.agent>;

export class VocaPathWorld extends World {
  app!: INestApplication;
  agent!: Agent;
  accessToken?: string;
  email?: string;
  password?: string;
  response!: Response;
  memory = new Map<string, unknown>();

  constructor(options: IWorldOptions) {
    super(options);
  }

  start(app: INestApplication) {
    this.app = app;
    this.agent = request.agent(app.getHttpServer());
    this.accessToken = undefined;
    this.memory.clear();
  }

  async call(method: 'get' | 'post' | 'put' | 'delete', path: string, body?: object, token = this.accessToken) {
    let req = this.agent[method](path);
    if (token) req = req.set('Authorization', `Bearer ${token}`);
    this.response = await (body ? req.send(body) : req);
    return this.response;
  }

  async register(name: string, email: string, password: string) {
    return this.call('post', '/auth/register', { name, email, password, confirmPassword: password });
  }

  async login(email: string, password: string) {
    const response = await this.call('post', '/auth/login', { email, password }, undefined);
    if (response.status === 200) this.accessToken = response.body.accessToken;
    return response;
  }
}

setWorldConstructor(VocaPathWorld);
