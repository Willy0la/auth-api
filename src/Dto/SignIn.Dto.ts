import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsNumberString,
  Length,
  ValidateIf,
} from 'class-validator';
import { AtLeastOneOf } from 'src/common/decorator/validator';

export class SignInDto {
  @ApiProperty({ example: 'willy0la' })
  @AtLeastOneOf('password', 'pinCode')
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username cannot be empty' })
  identifier!: string;

  @ApiProperty({ example: 'password123', required: false })
  @ValidateIf((o) => o.password !== undefined)
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password?: string;

  @ApiProperty({ example: '1234', required: false })
  @ValidateIf((o) => o.pinCode !== undefined)
  @IsNumberString({}, { message: 'PIN must contain only numbers' })
  @IsNotEmpty({ message: 'PIN cannot be empty' })
  @Length(4, 6, { message: 'PIN must be between 4 and 6 digits' })
  pinCode?: string;
}
