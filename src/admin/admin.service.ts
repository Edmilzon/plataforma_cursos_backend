import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  CreateRoleDto,
  AssignPermissionsDto,
  CreateUserDto,
  UpdateUserDto,
  AssignRolesToUserDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly dataSource: DataSource) {}
  
  async findAllRoles() {
    const query = 'SELECT * FROM rol';
    return this.dataSource.query(query);
  }

  async findRoleById(id: number) {
    const query = 'SELECT * FROM rol WHERE id_rol = ?';
    const roles = await this.dataSource.query(query, [id]);
    if (roles.length === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return roles[0];
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const { nombre, descripcion, icono_url } = createRoleDto;
    const query =
      'INSERT INTO rol (nombre, descripcion, icono_url) VALUES (?, ?, ?)';
    try {
      const result = await this.dataSource.query(query, [
        nombre,
        descripcion,
        icono_url,
      ]);
      return { id_rol: result.insertId, ...createRoleDto };
    } catch (error) {
      throw new InternalServerErrorException('Could not create role', error.message);
    }
  }

  async deleteRole(id: number) {
    await this.findRoleById(id); // Verifica si el rol existe
    // Usamos una transacción para asegurar la consistencia
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.query('DELETE FROM rol_permiso WHERE id_rol = ?', [id]);
      await queryRunner.query('DELETE FROM usuario_rol WHERE id_rol = ?', [id]);
      await queryRunner.query('DELETE FROM rol WHERE id_rol = ?', [id]);
      await queryRunner.commitTransaction();
      return { message: `Role with ID ${id} deleted successfully` };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Could not delete role', err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async assignPermissionsToRole(
    roleId: number,
    assignPermissionsDto: AssignPermissionsDto,
  ) {
    await this.findRoleById(roleId); // Verifica si el rol existe
    const { permissionIds } = assignPermissionsDto;

    const values = permissionIds.map((permId) => [roleId, permId]);
    const query = 'INSERT INTO rol_permiso (id_rol, id_permiso) VALUES ?';

    try {
      // Primero, opcionalmente, borramos los permisos existentes para evitar duplicados
      await this.dataSource.query('DELETE FROM rol_permiso WHERE id_rol = ?', [roleId]);
      // Luego insertamos los nuevos
      await this.dataSource.query(query, [values]);
      return { message: `Permissions assigned to role ${roleId}` };
    } catch (error) {
      throw new InternalServerErrorException('Could not assign permissions', error.message);
    }
  }

  // ==============================================================================
  // PERMISOS
  // ==============================================================================

  async findAllPermissions() {
    const query = 'SELECT * FROM permiso';
    return this.dataSource.query(query);
  }

  async findPermissionsByRoleId(roleId: number) {
    await this.findRoleById(roleId); // Verifica si el rol existe
    const query = `
      SELECT p.id_permiso, p.nombre, p.descripcion
      FROM permiso p
      JOIN rol_permiso rp ON p.id_permiso = rp.id_permiso
      WHERE rp.id_rol = ?
    `;
    const permissions = await this.dataSource.query(query, [roleId]);
    return permissions;
  }

  // ==============================================================================
  // USUARIOS
  // ==============================================================================

  async findAllUsersWithRoles() {
    const query = `
      SELECT 
        u.id_usuario, u.nombre, u.apellido, u.correo, u.fecha_registro,
        (
          SELECT JSON_ARRAYAGG(JSON_OBJECT('id_rol', r.id_rol, 'nombre', r.nombre))
          FROM usuario_rol ur
          JOIN rol r ON ur.id_rol = r.id_rol
          WHERE ur.id_usuario = u.id_usuario
        ) as roles
      FROM usuario u
    `;
    const users = await this.dataSource.query(query);
    return users.map((user) => ({
      ...user,
      roles: user.roles ? JSON.parse(user.roles) : [],
    }));
  }

  async findUserById(id: number) {
    const userQuery = 'SELECT * FROM usuario WHERE id_usuario = ?';
    const users = await this.dataSource.query(userQuery, [id]);
    if (users.length === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return users[0];
  }

  async createUser(createUserDto: CreateUserDto) {
    const { nombre, apellido, edad, correo, password, avatar_url } =
      createUserDto;
    // Aquí deberías hashear la contraseña antes de guardarla
    // Por simplicidad, la guardamos en texto plano, pero NO es seguro.
    const query = `
      INSERT INTO usuario (nombre, apellido, edad, correo, password, avatar_url, fecha_registro) 
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;
    try {
      const result = await this.dataSource.query(query, [
        nombre,
        apellido,
        edad,
        correo,
        password,
        avatar_url,
      ]);
      return { id_usuario: result.insertId, ...createUserDto };
    } catch (error) {
      // Chequea si el error es por correo duplicado
      if (error.code === 'ER_DUP_ENTRY') {
        throw new InternalServerErrorException(
          `User with email ${correo} already exists.`,
        );
      }
      throw new InternalServerErrorException(
        'Could not create user',
        error.message,
      );
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    await this.findUserById(id); // Verifica si el usuario existe
    const fields = Object.keys(updateUserDto);
    if (fields.length === 0) {
      return { message: 'No fields to update' };
    }
    const values = Object.values(updateUserDto);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');

    const query = `UPDATE usuario SET ${setClause} WHERE id_usuario = ?`;
    try {
      await this.dataSource.query(query, [...values, id]);
      return { id_usuario: id, ...updateUserDto };
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not update user',
        error.message,
      );
    }
  }

  async deleteUser(id: number) {
    await this.findUserById(id); // Verifica si el usuario existe
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Eliminar dependencias (ajusta según tu esquema y lógica de negocio)
      await queryRunner.query('DELETE FROM usuario_rol WHERE id_usuario = ?', [id]);
      // Finalmente, eliminar el usuario
      await queryRunner.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
      await queryRunner.commitTransaction();
      return { message: `User with ID ${id} deleted successfully` };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Could not delete user', err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async assignRolesToUser(
    userId: number,
    assignRolesDto: AssignRolesToUserDto,
  ) {
    await this.findUserById(userId); // Verifica si el usuario existe
    const { roleIds } = assignRolesDto;

    // Opcional pero recomendado: Verificar que todos los roles existan.
    for (const roleId of roleIds) {
      await this.findRoleById(roleId);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Eliminar roles actuales del usuario
      await queryRunner.query('DELETE FROM usuario_rol WHERE id_usuario = ?', [userId]);

      // 2. Insertar los nuevos roles
      if (roleIds.length > 0) {
        const values = roleIds.map((roleId) => [userId, roleId]);
        await queryRunner.query('INSERT INTO usuario_rol (id_usuario, id_rol) VALUES ?', [values]);
      }

      await queryRunner.commitTransaction();
      return { message: `Roles for user with ID ${userId} have been updated.` };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Could not assign roles to user', err.message);
    } finally {
      await queryRunner.release();
    }
  }
}