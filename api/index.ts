import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module.js';

const server = express();
let ready: Promise<void> | null = null;

function init() {
  if (!ready) {
    ready = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
      app.enableCors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
      });
      await app.init();
    })();
  }
  return ready;
}

export default async function handler(req: any, res: any) {
  await init();
  server(req, res);
}