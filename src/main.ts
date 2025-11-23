import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module.js';
import 'reflect-metadata';
import { AppDataSource } from './lib/data-source.js';

async function bootstrap() {
  await AppDataSource.initialize();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
