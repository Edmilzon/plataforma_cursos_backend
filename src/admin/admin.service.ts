import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateRoleDto, AssignPermissionsDto } from './dto/admin.dto';

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
}