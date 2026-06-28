import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseService } from 'src/base/base.service';
import { SignUpDto } from 'src/Dto/SignUp.dto';
import { Connection, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  UserSanitizer,
  SanitizedUser,
} from 'src/common/sanitizer/user.sanitizer';
import { SignInDto } from 'src/Dto/SignIn.Dto';
import * as bcrypt from 'bcrypt';
import { successResponse } from 'src/common/helper/response.helpers';
@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MS = 15 * 60 * 1000;
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly baseModel: BaseService,
    private readonly jwtService: JwtService,
  ) {
    this.logger.log('User Service has been initialised');
  }

  // in createUser:
  async createUser(dto: SignUpDto) {
    const session = await this.connection.startSession();
    let payload: { sub: any; email: string; userName: string } | null = null;
    let sanitizedUser: SanitizedUser | null = null;
    try {
      await session.withTransaction(async () => {
        const { userName, email } = dto;
        const existingUser = await this.baseModel.findUser(userName, email);

        if (existingUser) {
          throw new BadRequestException('Username or Email already exists');
        }

        const newUser = await this.baseModel.createUserBase(dto, session);

        payload = {
          sub: newUser._id,
          email: newUser.email,
          userName: newUser.userName,
        };

        sanitizedUser = UserSanitizer(newUser);
      });

      const token = this.jwtService.sign(payload!);
      return successResponse('User created successfully', {
        user: sanitizedUser,
        token,
      });
    } finally {
      await session.endSession();
    }
  }
  async loginUser(dto: SignInDto) {
    const { identifier, password, pinCode } = dto;

    const user = await this.baseModel.findUserLogin(identifier);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await user.save();

    if (user.loginLockedUntil) {
      throw new UnauthorizedException(
        'Account is temporarily locked. Please try again later',
      );
    }

    let isValid = false;
    if (password) {
      isValid = await bcrypt.compare(password, user.password);
    } else if (pinCode) {
      isValid = await bcrypt.compare(pinCode, user.pinCode);
    }

    if (!isValid) {
      user.loginRetryCount += 1;

      if (user.loginRetryCount >= this.MAX_ATTEMPTS) {
        user.loginLockedUntil = new Date(Date.now() + this.LOCK_DURATION_MS);
        user.loginRetryCount = 0;
      }

      await user.save();
      throw new UnauthorizedException('Invalid credentials');
    }

    user.loginRetryCount = 0;
    await user.save();

    const payload = {
      sub: user._id,
      userName: user.userName,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return successResponse('Login successful', {
      user: UserSanitizer(user),
      token,
    });
  }
  async fetchUser(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    const user = await this.baseModel.getUser(id);
    if (!user) {
      throw new NotFoundException('User Not found');
    }
    return successResponse('User fetched ', {
      user: UserSanitizer(user),
    });
  }
}
