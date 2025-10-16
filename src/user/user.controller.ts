import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRole } from './dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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