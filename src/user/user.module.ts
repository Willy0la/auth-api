import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BaseModule } from 'src/base/base.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): any => ({
        secret: config.get<string>('SECRET'),
        signOptions: {
          expiresIn: config.get<string>('TTL', '7d'),
        },
      }),
    }),
    BaseModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
