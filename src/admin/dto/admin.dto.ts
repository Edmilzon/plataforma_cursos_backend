import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  ArrayNotEmpty,
  IsEmail,
} from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsString()
  @IsOptional()
  icono_url?: string;
}

export class AssignPermissionsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  permissionIds: number[];
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsInt()
  @IsOptional()
  edad?: number;

  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  avatar_url?: string;

  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  roleIds?: number[]; 
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  apellido?: string;

  @IsInt()
  @IsOptional()
  edad?: number;

  @IsEmail()
  @IsOptional()
  correo?: string;
}

export class AssignRolesToUserDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  roleIds: number[];
}
