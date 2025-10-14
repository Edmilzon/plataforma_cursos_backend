import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";

export class UserController {
    constructor(
        private readonly userService: UserService
    ){}

    @Post('register')
    async registerUser(@Body() date: UserDto){
        const newUser = await this.userService.registerUser(date);

        return {
            message: "usuario registrado correctamente",
            status: 201
        }
    }

    @Post('login')
    async loginUser(@Body() date: UserDto) {
        const login = await this.userService.loginUser(date);
        const { password, ...userNotPassword } = login.user;

        return {
            message: "Login exitoso",
            status: 200,
            token: login.token,
            user: userNotPassword
        }
    }
    
}