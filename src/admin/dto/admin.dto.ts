
import { IsString, IsInt, IsEmail, IsOptional, IsNumber, IsBoolean, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsInt()
  @Min(0)
  @Max(150)
  edad: number;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  password: string; // En un entorno real, la contraseña debe ser hasheada antes de guardarse.

  @IsOptional()
  @IsString()
  avatar_url?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  apellido?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  edad?: number;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  correo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string; // En un entorno real, la contraseña debe ser hasheada antes de guardarse.

  @IsOptional()
  @IsString()
  avatar_url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  saldo_punto?: number;
}

export class AssignRoleToUserDto {
  @IsInt()
  @IsNotEmpty()
  id_usuario: number;

  @IsInt()
  @IsNotEmpty()
  id_rol: number;
}

// --- DTOs para Rol ---

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  icono_url?: string;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  icono_url?: string;
}

export class AssignPermissionToRoleDto {
  @IsInt()
  @IsNotEmpty()
  id_rol: number;

  @IsInt()
  @IsNotEmpty()
  id_permiso: number;
}

// --- DTOs para Permiso ---

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
