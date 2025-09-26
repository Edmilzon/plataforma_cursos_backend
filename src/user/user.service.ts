import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserEntity } from "./entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { UserDto } from "./dto/user.dto";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class UserService{
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly jwtService: JwtService,
    ){}

    //REGISTER USER
    async registerUser (date: UserDto): Promise<UserEntity>{
        const validate = await this.validarEP(date.email, date.phone);
        if(validate) throw new BadRequestException ("El email o el telefono ya existen");

        const newUser = new UserEntity();
            newUser.name = date.name;
            newUser.lastname = date.lastname;
            newUser.email = date.email;
            newUser.password = await bcrypt.hash(date.password, 10)
            newUser.phone = date.phone;
            newUser.rol = date.rol;

            return await this.userRepository.save(newUser);
    }

    async validarEP (mail: string, phon: string): Promise<Boolean> {
        const validate = await this.userRepository.exists({
            where:[
                {email: mail},
                {phone: phon}
            ]
        })

        return validate;
    }

    //LOGIN USER 
    async loginUser(data:UserDto){
        const user = await this.userRepository.findOne({where: {email: data.email}});
        const validatePassword = await bcrypt.compare(data.password, user?.password);
        if(!user || !validatePassword) throw new UnauthorizedException("credenciales incorrectos");

        const payload  = {sub: user.id, email: user.email};
        const token = this.jwtService.sign(payload);

        return {
            token, 
            user
        }
    }
}