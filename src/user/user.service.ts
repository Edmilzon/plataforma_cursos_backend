import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, Ip } from "@nestjs/common";
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
    
    async registerUser (userDto: UserDto, ip: string): Promise<Omit<User, 'password'>> {
        const userExists = await this.findUserByEmailWithPassword(userDto.correo);
        if (userExists) {
            throw new BadRequestException("El email ya existe");
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const camposAInsertar = ['nombre', 'apellido', 'correo', 'password']; 
            const valores: (string | number)[] = [
                userDto.nombre,
                userDto.apellido,
                userDto.correo,
                userDto.password,
            ];

            if (userDto.edad) {
                camposAInsertar.push('edad');
                valores.push(userDto.edad);
            }
            if (userDto.avatar_url) {
                camposAInsertar.push('avatar_url');
                valores.push(userDto.avatar_url);
            }

            const placeholders = valores.map(() => '?').join(', ');
            const campos = camposAInsertar.join(', ');
            const insertUserQuery = `INSERT INTO usuario (${campos}, fecha_registro) VALUES (${placeholders}, NOW())`;
            const userInsertResult = await queryRunner.query(insertUserQuery, valores);
            const newUserId = userInsertResult.insertId;

            const rolParaBuscar = userDto.rol || UserRole.Estudiante;
            const getRolQuery = `SELECT id_rol FROM rol WHERE nombre = ?`;
            const roles = await queryRunner.query(getRolQuery, [rolParaBuscar]);
            if (roles.length === 0) {
                throw new BadRequestException(`El rol '${rolParaBuscar}' no es válido.`);
            }
            const rolId = roles[0].id_rol;

            const insertUsuarioRolQuery = `
                INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (?, ?)
            `;
            await queryRunner.query(insertUsuarioRolQuery, [newUserId, rolId]);

            await this.logSystemEvent(
                queryRunner,
                'NUEVO_REGISTRO',
                newUserId,
                'usuario',
                `El usuario ${userDto.correo} se ha registrado con el rol ${rolParaBuscar}.`,
                ip,
            );
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
    
    async loginUser(
        loginDto: LoginUserDto,
        ip: string,
      ): Promise<{ token: string; user: Omit<User, 'password'> }> {
        const { correo, password: loginPassword } = loginDto;
        const user = await this.findUserByEmailWithPassword(loginDto.correo);
    
        if (!user) {
          await this.logAuthAttempt(
            null,
            'INTENTO_FALLIDO',
            ip,
            `Intento de login fallido para el correo: ${correo}. Usuario no encontrado.`,
          );
          throw new UnauthorizedException('Credenciales incorrectas');
        }
    
        if (!user.password) {
          await this.logAuthAttempt(
            user.id_usuario,
            'INTENTO_FALLIDO',
            ip,
            `Intento de login para ${correo}. La cuenta no tiene contraseña.`,
          );
          throw new InternalServerErrorException(
            'No se pudo verificar la contraseña del usuario.',
          );
        }
    
        const isPasswordValid = loginPassword === user.password;
    
        if (!isPasswordValid) {
          await this.logAuthAttempt(
            user.id_usuario,
            'INTENTO_FALLIDO',
            ip,
            `Intento de login fallido para ${correo}. Contraseña incorrecta.`,
          );
          throw new UnauthorizedException('Credenciales incorrectas');
        }
    
        const payload = { sub: user.id_usuario, correo: user.correo, rol: user.rol };
        const token = this.jwtService.sign(payload);
    
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userToReturn } = user; // 'password' es omitido del objeto de retorno
    
        await this.logAuthAttempt(
          user.id_usuario,
          'LOGIN',
          ip,
          `Login exitoso para ${correo}.`,
        );
    
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

    async getSaldoPunto(id: number): Promise<{ saldo_punto: number }> {
        const query = `SELECT saldo_punto FROM usuario WHERE id_usuario = ?`;
        const result = await this.dataSource.query(query, [id]);
    
        if (result.length === 0) {
            throw new NotFoundException(`Usuario con ID #${id} no encontrado.`);
        }
    
        return result[0];
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
        const query = `
            SELECT u.*, r.nombre as rol
            FROM usuario u
            LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
            LEFT JOIN rol r ON ur.id_rol = r.id_rol
            WHERE u.correo = ? LIMIT 1;
        `;
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

    private async logAuthAttempt(
        id_usuario: number | null,
        tipo_evento: 'LOGIN' | 'INTENTO_FALLIDO',
        direccion_ip: string,
        detalle: string,
      ) {
        const query = `
          INSERT INTO bitacora_autenticacion (id_usuario, tipo_evento, fecha, direccion_ip, detalle)
          VALUES (?, ?, NOW(), ?, ?)
        `;
        try {
          await this.dataSource.query(query, [id_usuario, tipo_evento, direccion_ip, detalle]);
        } catch (error) {
          console.error('Error al registrar en la bitácora de autenticación:', error);
        }
      }

      private async logSystemEvent(
        queryRunner: QueryRunner,
        tipo_evento: string,
        id_usuario: number | null,
        tabla_afectada: string,
        descripcion: string,
        direccion_ip: string,
      ) {
        const query = `
          INSERT INTO bitacora_sistema (tipo_evento, id_usuario, tabla_afectada, descripcion, fecha_evento, direccion_ip)
          VALUES (?, ?, ?, ?, NOW(), ?)
        `;
        try {
          await queryRunner.query(query, [tipo_evento, id_usuario, tabla_afectada, descripcion, direccion_ip]);
        } catch (error) {
          // No relanzamos el error para no interrumpir el flujo principal si la bitácora falla
          console.error('Error al registrar en la bitácora del sistema:', error);
        }
      }
}