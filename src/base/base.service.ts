import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/user/user.schema';
import { Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { SignUpDto } from 'src/Dto/SignUp.dto';
import * as bcrypt from 'bcrypt';
import { ClientSession } from 'mongoose';

@Injectable()
export class BaseService {
  private logger = new Logger(BaseService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    this.logger.log('Base Service has been initialized');
  }

  async findUser(
    userName: string,
    email: string,
  ): Promise<UserDocument | null> {
    return await this.userModel.findOne({
      $or: [{ userName }, { email }],
      deletedAt: null,
    });
  }
  async createUserBase(
    dto: SignUpDto,
    session: ClientSession,
  ): Promise<UserDocument> {
    const { password, pinCode } = dto;

    const [hashedPassword, hashedPinCode] = await Promise.all([
      bcrypt.hash(password, 12),
      bcrypt.hash(pinCode, 12),
    ]);
    const [newUser] = await this.userModel.create(
      [
        {
          ...dto,
          password: hashedPassword,
          pinCode: hashedPinCode,
        },
      ],
      { session },
    );
    return newUser;
  }
  async findUserLogin(identifier: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({
      $or: [{ email: identifier }, { userName: identifier }],
      deletedAt: null,
    });
  }

  async getUser(id: string): Promise<UserDocument | null> {
    return await this.userModel
      .findById(id)
      .select('-password -pinCode')
      .exec();
  }
}
