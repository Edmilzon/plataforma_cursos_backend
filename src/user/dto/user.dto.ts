import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

// Es una buena práctica definir los roles como un enum para tener una fuente única de verdad.
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest',
}

export class UserDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    lastname: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @IsOptional() // Hacemos el teléfono opcional
    @IsString()
    phone?: string; // Se puede marcar como opcional con `?`

    @IsNotEmpty()
    @IsEnum(UserRole) // Validamos que el rol sea uno de los valores del enum
    role: UserRole; // Cambiamos el nombre a 'role' y el tipo a 'UserRole'
}
