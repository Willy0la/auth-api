import {
  Body,
  Controller,
  Logger,
  Post,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDto } from 'src/Dto/SignUp.dto';
import { SignInDto } from 'src/Dto/SignIn.Dto';
import { JwtAuthGuard } from 'src/guard/jwt.guard';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  private logger = new Logger(UserController.name);
  constructor(private readonly userService: UserService) {
    this.logger.log('User controller has been initialised');
  }
  @ApiOperation({ summary: 'Create a new user account' }) 
  @Post('/register')
  async createUser(@Body() dto: SignUpDto) {
    return this.userService.createUser(dto);
  }
  @ApiOperation({ summary: 'Login with email/username and password or PIN' })
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('/login')
  async loginUser(@Body() dto: SignInDto) {
    return this.userService.loginUser(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile by ID' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return await this.userService.fetchUser(id);
  }
}
