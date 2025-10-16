import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export enum UserRole {
    ADMINISTRADOR = 'Administrador',
    DOCENTE = 'Docente',
    ESTUDIANTE = 'Estudiante',
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
