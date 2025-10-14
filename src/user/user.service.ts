import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserEntity } from "./entity/user.entity";
import { InjectDataSource } from "@nestjs/typeorm";
import { UserDto } from "./dto/user.dto";
import { DataSource } from "typeorm";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class UserService{
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService,
    ){}

    //REGISTER USER
    async registerUser (date: UserDto): Promise<UserEntity>{
        const validate = await this.validarEP(date.email, date.phone);
        if(validate) throw new BadRequestException("El email o el teléfono ya existen");

        const hashedPassword = await bcrypt.hash(date.password, 10);

        const query = `
            INSERT INTO "user" (name, lastname, email, password, phone, rol)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const result = await this.dataSource.query(query, [
            date.name,
            date.lastname,
            date.email,
            hashedPassword,
            date.phone,
            date.rol
        ]);

        return result[0];
    }

    async validarEP (mail: string, phon: string): Promise<boolean> {
        const query = `SELECT 1 FROM "user" WHERE email = $1 OR phone = $2 LIMIT 1;`;
        const result = await this.dataSource.query(query, [mail, phon]);

        return result.length > 0;
    }

    //LOGIN USER 
    async loginUser(data:UserDto){
        const query = `SELECT * FROM "user" WHERE email = $1;`;
        const result = await this.dataSource.query(query, [data.email]);

        const user: UserEntity = result[0];

        const validatePassword = user ? await bcrypt.compare(data.password, user.password) : false;

        if(!user || !validatePassword) throw new UnauthorizedException("credenciales incorrectos");

        const payload  = {sub: user.id, email: user.email};
        const token = this.jwtService.sign(payload);

        return {
            token, 
            user
        }
    }
}