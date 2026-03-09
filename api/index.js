const express = require('express');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./server/dist/app.module');
const { HttpStatusInterceptor } = require('./server/dist/interceptors/http-status.interceptor');

let cachedApp = null;

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

module.exports = async function handler(req, res) {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();

  return expressApp(req, res);
};
