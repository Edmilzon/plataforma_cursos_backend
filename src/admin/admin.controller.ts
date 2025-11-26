import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateRoleDto, AssignPermissionsDto } from './dto/admin.dto';

@Controller('admin')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('roles')
  findAllRoles() {
    return this.adminService.findAllRoles();
  }

  @Post('roles')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.adminService.createRole(createRoleDto);
  }

  @Get('roles/:id')
  findRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findRoleById(id);
  }

  @Delete('roles/:id')
  @HttpCode(204)
  deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteRole(id);
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
}