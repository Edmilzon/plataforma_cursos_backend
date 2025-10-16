import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { UserDto, UserRole } from "./dto/user.dto";
import { DataSource, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { LoginUserDto } from "./dto/login-user.dto";
import { User } from "./interfaces/user.interface";



@Injectable()
export class UserService{
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService,
    ){}
    
    async registerUser (userDto: UserDto): Promise<Omit<User, 'password'>> {
        const userExists = await this.findUserByEmailWithPassword(userDto.correo);
        if (userExists) {
            throw new BadRequestException("El email ya existe");
        }

        const hashedPassword = await bcrypt.hash(userDto.password, 10);

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const camposAInsertar = ['nombre', 'apellido', 'correo', 'password'];
            const valores = [
                userDto.nombre,
                userDto.apellido,
                userDto.correo,
                hashedPassword,
            ];

            if (userDto.edad) {
                camposAInsertar.push('edad');
                valores.push(userDto.edad);
            }
            if (userDto.avatar_url) {
                camposAInsertar.push('avatar_url');
                valores.push(userDto.avatar_url);
            }

            // 1. Insertar en la tabla usuario
            const placeholders = valores.map(() => '?').join(', '); // Genera ?, ?, ?, ...
            const campos = camposAInsertar.join(', ');
            const insertUserQuery = `INSERT INTO usuario (${campos}, fecha_registro) VALUES (${placeholders}, NOW())`;
            const userInsertResult = await queryRunner.query(insertUserQuery, valores);
            const newUserId = userInsertResult.insertId;

            // 2. Obtener el id_rol a partir del nombre del rol
            const rolParaBuscar = userDto.rol || UserRole.ESTUDIANTE;
            const getRolQuery = `SELECT id_rol FROM rol WHERE nombre = ?`;
            const roles = await queryRunner.query(getRolQuery, [rolParaBuscar]);
            if (roles.length === 0) {
                throw new BadRequestException(`El rol '${rolParaBuscar}' no es válido.`);
            }
            const rolId = roles[0].id_rol;

            // 3. Insertar en la tabla usuario_rol
            const insertUsuarioRolQuery = `
                INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)
            `;
            await queryRunner.query(insertUsuarioRolQuery, [newUserId, rolId]);

            await queryRunner.commitTransaction();

            const newUser = await this.findUserByIdWithPassword(newUserId);
            if (!newUser) {
                throw new Error('Error al crear el usuario.');
            }
            
            const { password, ...userWithoutPassword } = newUser;
            return userWithoutPassword;

        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new InternalServerErrorException('Error al registrar el usuario.', err.message);
        } finally {
            await queryRunner.release();
        }
    }
    
    async loginUser(loginDto: LoginUserDto): Promise<{ token: string; user: Omit<User, 'password'> }> {
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.edad, u.correo, u.password, u.fecha_registro, u.avatar_url, u.saldo_punto, r.nombre as rol
            FROM usuario u
            JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
            JOIN rol r ON ur.id_rol = r.id_rol
            WHERE u.correo = ?;
        `;
        const result: User[] = await this.dataSource.query(query, [loginDto.correo]);
        
        if (result.length === 0) {
            throw new UnauthorizedException("Credenciales incorrectas");
        }
        
        const user: User = result[0];
        
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password!);
        
        if (!isPasswordValid) {
            throw new UnauthorizedException("Credenciales incorrectas");
        }
        
        const payload  = { sub: user.id_usuario, correo: user.correo, rol: user.rol };
        const token = this.jwtService.sign(payload);
        
        const { password, ...userToReturn } = user;
        
        return {
            token, 
            user: userToReturn
        };
    }
    
    async findAll(): Promise<Omit<User, 'password'>[]> {
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.edad, u.correo, u.fecha_registro, u.avatar_url, u.saldo_punto, r.nombre as rol
            FROM usuario u
            LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN rol r ON ur.id_rol = r.id_rol;
        `;
        return this.dataSource.query(query);
    }

    async findOne(id: number): Promise<Omit<User, 'password'>> {
        const user = await this.findUserById(id);
        if (!user) {
            throw new NotFoundException(`Usuario con ID #${id} no encontrado.`);
        }
        return user;
    }

    async findByRole(rol: string): Promise<Omit<User, 'password'>[]> {
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.edad, u.correo, u.fecha_registro, u.avatar_url, u.saldo_punto, r.nombre as rol
            FROM usuario u
            JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
            JOIN rol r ON ur.id_rol = r.id_rol
            WHERE r.nombre = ?;
        `;
        const users = await this.dataSource.query(query, [rol]);
        if (users.length === 0) {
            throw new NotFoundException(`No se encontraron usuarios con el rol '${rol}'.`);
        }
        return users;
    }
    
    private async findUserByEmailWithPassword(email: string): Promise<User | null> {
        const query = `SELECT * FROM usuario WHERE correo = ? LIMIT 1;`; // Needs password for login/register checks
        const result = await this.dataSource.query(query, [email]);
        return result.length > 0 ? result[0] : null;
    }
    
    private async findUserByIdWithPassword(id: number): Promise<User | null> {
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.password, u.fecha_registro, u.avatar_url, u.saldo_punto, r.nombre as rol
            FROM usuario u
            LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN rol r ON ur.id_rol = r.id_rol
            WHERE u.id_usuario = ?;
        `;
        const result: User[] = await this.dataSource.query(query, [id]);
        return result.length > 0 ? result[0] : null;
    }

    async findUserById(id: number): Promise<Omit<User, 'password'> | null> {
        const query = `
            SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.fecha_registro, u.avatar_url, u.saldo_punto, r.nombre as rol
            FROM usuario u
            LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN rol r ON ur.id_rol = r.id_rol
            WHERE u.id_usuario = ?;
        `;
        const result: Omit<User, 'password'>[] = await this.dataSource.query(query, [id]);
        return result.length > 0 ? result[0] : null;
    }
}