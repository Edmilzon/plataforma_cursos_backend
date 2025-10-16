import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class LoginUserDto {
    @IsEmail()
    @IsNotEmpty()
    correo: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;
}