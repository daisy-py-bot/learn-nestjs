import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS to allow frontend (localhost:3000) to talk to backend (localhost:3001)
  app.enableCors({
    // origin: 'http://localhost:3000', // frontend URL
    origin: 'https://uncommonupskillingfrontend.vercel.app',
    credentials: true, // if you use cookies or authorization headers that need credentials
  });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
