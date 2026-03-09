import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import * as express from 'express';
import { HttpStatusInterceptor } from './src/interceptors/http-status.interceptor';

let cachedApp: any = null;

async function bootstrap() {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalInterceptors(new HttpStatusInterceptor());
  app.enableShutdownHooks();

  cachedApp = app;

  return app;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();

  return expressApp(req, res);
}
