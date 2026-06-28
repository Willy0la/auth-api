import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          scriptSrc: [`'self'`, `'unsafe-inline'`, `https://jsdelivr.net`],
          styleSrc: [`'self'`, `'unsafe-inline'`, `https://jsdelivr.net`],
          imgSrc: [`'self'`, `data:`, `https://jsdelivr.net`],
        },
      },
    }),
  );
  const logger = new Logger('bootstrap');

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 5000);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: config.get<string>('CLIENT_URL'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
  if (config.get<string>('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Auth API')
      .setDescription('User authentication and management API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
  }
  await app.listen(port);

  logger.log(`server is listening on  http://localhost:${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/api`);
}

void bootstrap();
