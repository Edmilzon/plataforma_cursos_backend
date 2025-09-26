import { IsEmail, IsEmpty, IsNotEmpty, IsString, MinLength } from "class-validator";


export class UserDto {

    @IsString()
    name: string;

    @IsString()
    lastname: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    rol: string;
}
