import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module.js';

const server = express();
let ready: Promise<void> | null = null;

function init() {
  if (!ready) {
    ready = (async () => {
      const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
      app.enableCors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
      });
      await app.init();
    })().catch((e) => {
      ready = null; 
      throw e;
    });
  }
  return ready;
}

export default async function handler(req: any, res: any) {
  await init();
  server(req, res);
}