import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  Put,
  UsePipes,
  Ip,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  CreateRoleDto,
  AssignPermissionsDto,
  CreateUserDto,
  UpdateUserDto,
  AssignRolesToUserDto,
} from './dto/admin.dto';

@Controller('admin')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('roles')
  findAllRoles() {
    return this.adminService.findAllRoles();
  }

  @Post('roles')
  createRole(
    @Body() createRoleDto: CreateRoleDto,
    @Query('adminId', ParseIntPipe) adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.createRole(createRoleDto, adminId, ip);
  }

  @Get('roles/:id')
  findRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findRoleById(id);
  }
  @Delete('roles/:id')
  @HttpCode(204)
  deleteRole(
    @Param('id', ParseIntPipe) id: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.deleteRole(id, adminId, ip);
  }

  @Post('roles/:id/permisos')
  assignPermissionsToRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.adminService.assignPermissionsToRole(id, assignPermissionsDto);
  }

  @Get('permisos')
  findAllPermissions() {
    return this.adminService.findAllPermissions();
  }

  @Get('roles/:id/permisos')
  findPermissionsByRoleId(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findPermissionsByRoleId(id);
  }

  // ==============================================================================
  // USUARIOS
  // ==============================================================================

  @Get('usuarios')
  findAllUsers() {
    return this.adminService.findAllUsersWithRoles();
  }

  @Post('usuarios')
  createUser(
    @Body() createUserDto: CreateUserDto,
    @Query('adminId', ParseIntPipe) adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.createUser(createUserDto, adminId, ip);
  }

  @Get('usuarios/:id')
  findUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findUserById(id);
  }

  @Put('usuarios/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('usuarios/:id')
  @HttpCode(204)
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @Ip() ip: string,
  ) {
    return this.adminService.deleteUser(id, adminId, ip);
  }

  @Post('usuarios/:id/roles')
  assignRolesToUser(
    @Param('id', ParseIntPipe) id: number,
    @Query('adminId', ParseIntPipe) adminId: number,
    @Body() assignRolesToUserDto: AssignRolesToUserDto,
  ) {
    return this.adminService.assignRolesToUser(id, adminId, assignRolesToUserDto);
  }
}