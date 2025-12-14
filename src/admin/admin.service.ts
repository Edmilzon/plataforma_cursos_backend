import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
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
  try {
    // ...
    
    // 1. Obtener todos los roles
    const rolesQuery = 'SELECT * FROM rol ORDER BY id_rol';
    const roles = await this.dataSource.query(rolesQuery);
    // ...
    
    // 2. Obtener TODAS las relaciones rol-permiso
    const relacionesQuery = `
      SELECT 
        rp.id_rol,
        p.id_permiso,
        p.nombre,
        p.descripcion
      FROM rol_permiso rp
      JOIN permiso p ON rp.id_permiso = p.id_permiso
      ORDER BY rp.id_rol, p.id_permiso
    `;
    
    const relaciones = await this.dataSource.query(relacionesQuery);
    // ...
    
    // 3. Agrupar permisos por rol
    const permisosPorRol = new Map();
    
    for (const relacion of relaciones) {
      const roleId = relacion.id_rol;
      
      if (!permisosPorRol.has(roleId)) {
        permisosPorRol.set(roleId, []);
      }
      
      permisosPorRol.get(roleId).push({
        id_permiso: relacion.id_permiso,
        nombre: relacion.nombre,
        descripcion: relacion.descripcion
      });
    }
    
    // 4. Combinar roles con sus permisos
    const rolesCompletos = roles.map((role) => {
      const permisos = permisosPorRol.get(role.id_rol) || [];
      
      // ...
      if (permisos.length > 0) {
        // ...
      }
      
      return {
        id_rol: role.id_rol,
        nombre: role.nombre,
        descripcion: role.descripcion || '',
        icono_url: role.icono_url || null,
        permisos: permisos
      };
    });
    
    // 5. DEBUG final
    // ...
    
    return rolesCompletos;
    
  } catch (error) {
    console.error(' ERROR en findAllRoles (seguro):', error);
    throw new InternalServerErrorException(`Error: ${error.message}`);
  }
}

  async findRoleById(id: number) {
    try {
      const query = 'SELECT * FROM rol WHERE id_rol = ?';
      const roles = await this.dataSource.query(query, [id]);
      if (roles.length === 0) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      
      // También obtener los permisos del rol
      const permisoQuery = `
        SELECT p.id_permiso, p.nombre, p.descripcion
        FROM rol_permiso rp
        JOIN permiso p ON rp.id_permiso = p.id_permiso
        WHERE rp.id_rol = ?
      `;
      const permisos = await this.dataSource.query(permisoQuery, [id]);
      
      return {
        ...roles[0],
        permisos: permisos || []
      };
    } catch (error) {
      console.error(` Error en findRoleById(${id}):`, error);
      throw error;
    }
  }

  async createRole(createRoleDto: CreateRoleDto, adminId: number, ip: string) {
    const { nombre, descripcion, icono_url } = createRoleDto;
    const query =
      'INSERT INTO rol (nombre, descripcion, icono_url) VALUES (?, ?, ?)';
    try {
      // ...
      const result = await this.dataSource.query(query, [
        nombre,
        descripcion,
        icono_url || null,
      ]);
      await this.logSystemEvent(
        this.dataSource.createQueryRunner(),
        'CREAR_ROL',
        adminId,
        'rol',
        `El administrador ID ${adminId} creó el rol '${nombre}'.`,
        ip,
      );
      return { id_rol: result.insertId, ...createRoleDto };
    } catch (error) {
      console.error(' Error en createRole:', error);
      throw new InternalServerErrorException('Could not create role', error.message);
    }
  }

  async deleteRole(id: number, adminId: number, ip: string) {
    try {
      const role = await this.findRoleById(id);
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await queryRunner.query('DELETE FROM rol_permiso WHERE id_rol = ?', [id]);
        await queryRunner.query('DELETE FROM usuario_rol WHERE id_rol = ?', [id]);
        await queryRunner.query('DELETE FROM rol WHERE id_rol = ?', [id]);
        await this.logSystemEvent(
          queryRunner,
          'ELIMINAR_ROL',
          adminId,
          'rol',
          `El administrador ID ${adminId} eliminó el rol '${role.nombre}' (ID: ${id}).`,
          ip,
        );
        await queryRunner.commitTransaction();
        return { message: `Role with ID ${id} deleted successfully` };
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException('Could not delete role', err.message);
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error(` Error en deleteRole(${id}):`, error);
      throw error;
    }
  }

  async assignPermissionsToRole(
    roleId: number,
    assignPermissionsDto: AssignPermissionsDto,
  ) {
    try {
      await this.findRoleById(roleId);
      const { permissionIds } = assignPermissionsDto;

      // Crear array de arrays para los valores
      const values = permissionIds.map((permId) => [roleId, permId]);
      
      // Usar una transacción
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // Eliminar permisos existentes
        await queryRunner.query('DELETE FROM rol_permiso WHERE id_rol = ?', [roleId]);
        
        // Insertar nuevos permisos si hay
        if (values.length > 0) {
          // Nota: VALUES ? solo funciona con múltiples valores
          // Para MySQL necesitamos construir la query dinámicamente
          const placeholders = values.map(() => '(?, ?)').join(', ');
          const flatValues = values.flat();
          
          const insertQuery = `INSERT INTO rol_permiso (id_rol, id_permiso) VALUES ${placeholders}`;
          await queryRunner.query(insertQuery, flatValues);
        }
        
        await queryRunner.commitTransaction();
        // ...
        
        // Devolver el rol actualizado con permisos
        return await this.findRoleById(roleId);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error(` Error en assignPermissionsToRole(${roleId}):`, error);
      throw new InternalServerErrorException('Could not assign permissions', error.message);
    }
  }

  // ==============================================================================
  // PERMISOS
  // ==============================================================================

  async findAllPermissions() {
    try {
      // ...
      const query = 'SELECT * FROM permiso ORDER BY nombre';
      const permissions = await this.dataSource.query(query);
      // ...
      return permissions;
    } catch (error) {
      console.error(' Error en findAllPermissions:', error);
      throw new InternalServerErrorException('Could not get permissions', error.message);
    }
  }

  async findPermissionsByRoleId(roleId: number) {
    try {
      await this.findRoleById(roleId);
      const query = `
        SELECT p.id_permiso, p.nombre, p.descripcion
        FROM permiso p
        JOIN rol_permiso rp ON p.id_permiso = rp.id_permiso
        WHERE rp.id_rol = ?
      `;
      const permissions = await this.dataSource.query(query, [roleId]);
      return permissions;
    } catch (error) {
      console.error(` Error en findPermissionsByRoleId(${roleId}):`, error);
      throw error;
    }
  }

  // ==============================================================================
  // USUARIOS
  // ==============================================================================

  async findAllUsersWithRoles() {
  try {
    // ...
    
    const query = `
      SELECT 
        u.id_usuario, 
        u.nombre, 
        u.apellido, 
        u.correo, 
        u.edad,
        u.fecha_registro,
        u.avatar_url,
        COALESCE(
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id_rol', r.id_rol, 
                'nombre', r.nombre,
                'descripcion', r.descripcion,
                'icono_url', r.icono_url
              )
            )
            FROM usuario_rol ur
            JOIN rol r ON ur.id_rol = r.id_rol
            WHERE ur.id_usuario = u.id_usuario
          ), 
          JSON_ARRAY()
        ) as roles
      FROM usuario u
      ORDER BY u.fecha_registro DESC
    `;
    
    // ...
    
    const users = await this.dataSource.query(query);
    // ...
    
    // Procesar de manera segura
    const processedUsers = users.map((user) => {
      try {
        let rolesArray = [];
        
        if (user.roles) {
          if (typeof user.roles === 'string') {
            rolesArray = JSON.parse(user.roles);
          } else if (Array.isArray(user.roles)) {
            rolesArray = user.roles;
          }
        }
        
        if (user.roles === '[]') {
          rolesArray = [];
        }
        
        // ...
        
        return {
          ...user,
          roles: rolesArray
        };
        
      } catch (error) {
        console.error(` Error procesando usuario ${user.id_usuario}:`, error);
        return {
          ...user,
          roles: []
        };
      }
    });
    
    return processedUsers;
    
  } catch (error) {
    console.error(' Error en findAllUsersWithRoles:', error);
    throw new InternalServerErrorException(
      `Error al obtener usuarios: ${error.message}`
    );
  }
}

  async findUserById(id: number) {
    try {
      const userQuery = 'SELECT * FROM usuario WHERE id_usuario = ?';
      const users = await this.dataSource.query(userQuery, [id]);
      if (users.length === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return users[0];
    } catch (error) {
      console.error(` Error en findUserById(${id}):`, error);
      throw error;
    }
  }

  async createUser(createUserDto: CreateUserDto, adminId: number, ip: string) {
    try {
      const { nombre, apellido, edad, correo, password, avatar_url, roleIds } = createUserDto;
      // ...
      
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      try {
        // 1. Crear el usuario
        const createUserQuery = `
          INSERT INTO usuario (nombre, apellido, edad, correo, password, avatar_url, fecha_registro) 
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        
        const result = await queryRunner.query(createUserQuery, [
          nombre,
          apellido,
          edad,
          correo,
          password, // IMPORTANTE: Deberías hashear esta contraseña
          avatar_url || null,
        ]);
        
        const userId = result.insertId;
        
        // 2. Asignar roles si se proporcionaron
        if (roleIds && roleIds.length > 0) {
          // Verificar que todos los roles existan
          for (const roleId of roleIds) {
            const roleExists = await queryRunner.query('SELECT 1 FROM rol WHERE id_rol = ?', [roleId]);
            if (roleExists.length === 0) {
              throw new NotFoundException(`Role with ID ${roleId} not found`);
            }
          }
          
          // Insertar relaciones usuario_rol
          const placeholders = roleIds.map(() => '(?, ?)').join(', ');
          const flatValues = roleIds.flatMap(roleId => [userId, roleId]);
          
          const insertRolesQuery = `INSERT INTO usuario_rol (id_usuario, id_rol) VALUES ${placeholders}`;
          await queryRunner.query(insertRolesQuery, flatValues);
          
          // Registrar cada rol asignado
          for (const roleId of roleIds) {
            await this.logRoleChange(
              queryRunner,
              adminId,
              userId,
              roleId,
              'ASIGNAR',
              `Se asignó el rol ID ${roleId} al usuario recién creado ID ${userId}.`
            );
          }
        }
        
        // 3. Registrar en bitácora del sistema
        await this.logSystemEvent(
          queryRunner,
          'CREAR_USUARIO_ADMIN',
          adminId,
          'usuario',
          `El administrador ID ${adminId} creó al usuario '${correo}' (ID: ${userId}).`,
          ip,
        );
        
        await queryRunner.commitTransaction();
        // ...
        
        // 4. Devolver el usuario creado con sus roles
        const user = await this.findUserWithRolesById(userId);
        return user;
        
      } catch (error) {
        await queryRunner.rollbackTransaction();
        
        if (error.code === 'ER_DUP_ENTRY') {
          throw new InternalServerErrorException(
            `User with email ${correo} already exists.`,
          );
        }
        
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error(' Error en createUser:', error);
      throw new InternalServerErrorException(
        'Could not create user',
        error.message,
      );
    }
  }

  // Función auxiliar para obtener usuario con roles
  private async findUserWithRolesById(id: number, queryRunner?: QueryRunner) {
    const runner = queryRunner || this.dataSource.createQueryRunner();
    
    try {
      const userQuery = 'SELECT * FROM usuario WHERE id_usuario = ?';
      const users = await runner.query(userQuery, [id]);
      
      if (users.length === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      const user = users[0];
      
      // Obtener roles del usuario
      const rolesQuery = `
        SELECT r.id_rol, r.nombre, r.descripcion, r.icono_url
        FROM usuario_rol ur
        JOIN rol r ON ur.id_rol = r.id_rol
        WHERE ur.id_usuario = ?
      `;
      
      const roles = await runner.query(rolesQuery, [id]);
      
      return {
        ...user,
        roles: roles || [],
      };
      
    } finally {
      if (!queryRunner) {
        await runner.release();
      }
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      await this.findUserById(id);
      const fields = Object.keys(updateUserDto);
      if (fields.length === 0) {
        return { message: 'No fields to update' };
      }
      const values = Object.values(updateUserDto);
      const setClause = fields.map((field) => `${field} = ?`).join(', ');

      const query = `UPDATE usuario SET ${setClause} WHERE id_usuario = ?`;
      await this.dataSource.query(query, [...values, id]);
      return { id_usuario: id, ...updateUserDto };
    } catch (error) {
      console.error(` Error en updateUser(${id}):`, error);
      throw new InternalServerErrorException(
        'Could not update user',
        error.message,
      );
    }
  }

  async deleteUser(id: number, adminId: number, ip: string) {
    try {
      const user = await this.findUserById(id);
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        await queryRunner.query('DELETE FROM usuario_rol WHERE id_usuario = ?', [id]);
        await queryRunner.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
        await this.logSystemEvent(
          queryRunner,
          'ELIMINAR_USUARIO',
          adminId,
          'usuario',
          `El administrador ID ${adminId} eliminó al usuario '${user.correo}' (ID: ${id}).`,
          ip,
        );
        await queryRunner.commitTransaction();
        return { message: `User with ID ${id} deleted successfully` };
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException('Could not delete user', err.message);
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error(` Error en deleteUser(${id}):`, error);
      throw error;
    }
  }

  async assignRolesToUser(
    userId: number,
    adminId: number,
    assignRolesDto: AssignRolesToUserDto,
  ) {
    try {
      await this.findUserById(userId);
      await this.findUserById(adminId);
      const { roleIds } = assignRolesDto;

      // Verificar que todos los roles existan
      for (const roleId of roleIds) {
        await this.findRoleById(roleId);
      }

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Eliminar roles actuales del usuario
        await queryRunner.query('DELETE FROM usuario_rol WHERE id_usuario = ?', [userId]);

        // Insertar los nuevos roles si hay
        if (roleIds.length > 0) {
          const placeholders = roleIds.map(() => '(?, ?)').join(', ');
          const flatValues = roleIds.flatMap(roleId => [userId, roleId]);
          
          const insertQuery = `INSERT INTO usuario_rol (id_usuario, id_rol) VALUES ${placeholders}`;
          await queryRunner.query(insertQuery, flatValues);

          // Registrar cada rol asignado en la bitácora
          for (const roleId of roleIds) {
            await this.logRoleChange(
              queryRunner,
              adminId,
              userId,
              roleId,
              'ASIGNAR',
              `Se asignó el rol ID ${roleId} al usuario ID ${userId}.`
            );
          }
        }

        await queryRunner.commitTransaction();
        // ...
        
        // Devolver el usuario actualizado con roles
        const user = await this.findUserWithRolesById(userId);
        return user;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error(` Error en assignRolesToUser(${userId}):`, error);
      throw new InternalServerErrorException('Could not assign roles to user', error.message);
    }
  }

  private async logRoleChange(
    queryRunner: QueryRunner,
    id_usuario_admin: number,
    id_usuario_afectado: number,
    id_rol: number,
    accion: 'ASIGNAR' | 'REMOVER',
    detalle: string,
  ) {
    const query = `
      INSERT INTO bitacora_roles (id_usuario_admin, id_usuario_afectado, id_rol, accion, fecha, detalle)
      VALUES (?, ?, ?, ?, NOW(), ?)
    `;
    try {
      await queryRunner.query(query, [
        id_usuario_admin,
        id_usuario_afectado,
        id_rol,
        accion,
        detalle,
      ]);
    } catch (error) {
      console.error('Error al registrar en la bitácora de roles:', error);
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
      console.error('Error al registrar en la bitácora del sistema:', error);
    }
  }
}