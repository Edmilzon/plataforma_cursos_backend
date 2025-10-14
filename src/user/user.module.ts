import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports:[
        ConfigModule.forRoot(),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: '1h'}
        })
    ],
    providers:[UserService],
    controllers: [UserController],
    exports: [UserService]
})
export  class UserModule{}