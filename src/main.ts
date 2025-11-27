import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // Set timezone to Shanghai (UTC+8)
  process.env.TZ = 'Asia/Shanghai';
  
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('calculate-competition');
  
  // Serve static files (public folder will be served at /calculate-competition/*)
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/calculate-competition',
  });
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  
  // Enable CORS for development
  app.enableCors();
  
  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000/calculate-competition');
}
bootstrap();
