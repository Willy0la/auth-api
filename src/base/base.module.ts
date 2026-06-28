import { Module } from '@nestjs/common';
import { BaseService } from './base.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/user.schema';
import { JwtStrategy } from 'src/strategy/jwt.Strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [BaseService, JwtStrategy],
  exports: [BaseService, JwtStrategy],
})
export class BaseModule {}
