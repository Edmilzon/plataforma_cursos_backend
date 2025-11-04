import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export enum UserRole {
    Administrador = 'Administrador',
    Docente = 'Docente',
    Estudiante = 'Estudiante',
}

export class UserDto {

    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    apellido: string;

    @IsEmail()
    @IsNotEmpty()
    correo: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsNumber()
    edad?: number;

    @IsOptional()
    @IsUrl()
    avatar_url?: string;

    @IsOptional()
    @IsEnum(UserRole)
    rol?: UserRole;
}
