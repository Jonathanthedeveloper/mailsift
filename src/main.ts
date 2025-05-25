import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
  });

  // Enable Versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Prefix all routes with /api
  app.setGlobalPrefix('api');

  // Enable Helmet for security
  app.use(helmet());

  // Enable Compression
  app.use(compression());

  app.enableShutdownHooks();

  // Enable Validation globally
  app.useGlobalPipes(new ValidationPipe());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(8000);
}
bootstrap();
