import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
  IsNumberString,
  Length,
  Matches,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({ example: 'Willy Adenuga' })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name!: string;

  @ApiProperty({ example: 'willy0la' })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username cannot be empty' })
  userName!: string;

  @ApiProperty({ example: 'willy@test.com' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[0-9])(?=.*[a-z])/, {
    message: 'Password must contain at least one letter and one number',
  })
  password!: string;

  @ApiProperty({ example: '1234' })
  @IsNumberString({}, { message: 'PIN must contain only numbers' })
  @IsNotEmpty({ message: 'PIN cannot be empty' })
  @Length(4, 6, { message: 'PIN must be between 4 and 6 digits' })
  pinCode!: string;

  @ApiProperty({ example: '+2348139726716' })
  @IsPhoneNumber('NG', { message: 'Must be a valid Nigerian number' })
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  phoneNumber!: string;
}
