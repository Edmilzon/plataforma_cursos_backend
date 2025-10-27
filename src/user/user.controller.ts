import { Controller, Get, Param, ParseIntPipe, Query, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, UserRole} from './dto/user.dto';
import{LoginUserDto} from './dto/login-user.dto';
import { User } from './interfaces/user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() userDto: UserDto): Promise<Omit<User, 'password'>> {
    return this.userService.registerUser(userDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginUserDto): Promise<{
    token: string;
    user: Omit<User, 'password'>;
  }> {
    return this.userService.loginUser(loginDto);
  }

  /**
   * @description Obtiene todos los usuarios
   * @returns {Promise<Omit<User, 'password'>[]>}
   */
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * @description Obtiene usuarios por rol.
   * @param {UserRole} rol - El rol para filtrar los usuarios.
   * @returns {Promise<Omit<User, 'password'>[]>}
   */
  @Get('rol')
  findByRole(@Query('rol') rol: UserRole) {
    return this.userService.findByRole(rol);
  }

  /**
   * @description Obtiene un usuario por su ID.
   * @param {number} id - El ID del usuario.
   * @returns {Promise<Omit<User, 'password'>>}
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }
}