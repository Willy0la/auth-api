import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as joi from 'joi';
import { MongooseModule } from '@nestjs/mongoose';
import { BaseModule } from './base/base.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.development.local',
        '.env.staging',
        '.env.production',
      ],
      validationSchema: joi.object({
        NODE_ENV: joi
          .string()
          .valid('development', 'staging', 'production')
          .default('development'),
        PORT: joi.number().default(5000),
        DB: joi.string().required(),
        SECRET: joi.string().required(),
        TTL: joi.string().required(),
        CLIENT_URL: joi.string().required(),
        THROTTLE_TTL: joi.number(),
        THROTTLE_LIMIT: joi.number(),
      }),
      validationOptions: {
        allUnknown: true,
        abortEarly: false,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('DB'),
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false,
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60000),
          limit: config.get<number>('THROTTLE_LIMIT', 5),
        },
      ],
    }),
    UserModule,
    BaseModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
