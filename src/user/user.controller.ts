import { Controller, Get, Param, ParseIntPipe, Query, Post, Body, HttpCode, HttpStatus, Ip } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, UserRole} from './dto/user.dto';
import{LoginUserDto} from './dto/login-user.dto';
import { User } from './interfaces/user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() userDto: UserDto, @Ip() ip: string): Promise<Omit<User, 'password'>> {
    return this.userService.registerUser(userDto, ip);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() loginDto: LoginUserDto,
    @Ip() ip: string,
  ): Promise<{
    token: string;
    user: Omit<User, 'password'>;
  }> {
    return this.userService.loginUser(loginDto, ip);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('rol')
  findByRole(@Query('rol') rol: UserRole) {
    return this.userService.findByRole(rol);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }
}