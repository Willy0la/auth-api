import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserDocument } from 'src/user/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private readonly user: Model<UserDocument>,
    private readonly config: ConfigService,
  ) {
    const secret = config.get<string>('SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.user
      .findById(payload.sub)
      .select('-password -pinCode');

    if (!user) {
      throw new UnauthorizedException('User unauthorized');
    }
    if (user.deletedAt) {
      throw new UnauthorizedException('User was deleted');
    }
    if (user.loginLockedUntil && user.loginLockedUntil > new Date()) {
      throw new UnauthorizedException('Account is currently locked');
    }
    return user;
  }
}
