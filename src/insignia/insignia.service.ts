import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InsigniaUsuarioDto } from './dto/insignia.dto';
import { CreateInsigniaDto, UpdateInsigniaDto } from './dto/create-insignia.dto';

@Injectable()
export class InsigniaService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // ==================== MÉTODOS EXISTENTES ====================

  /**
   * Obtiene todas las insignias que ha ganado un usuario específico.
   */
  async findInsigniasByUsuario(idUsuario: number): Promise<InsigniaUsuarioDto[]> {
    const query = `
      SELECT 
        i.id_insignia,
        i.nombre,
        i.descripcion,
        i.imagen_url,
        ui.fecha_otorgacion
      FROM usuario_insignia ui
      JOIN insignia i ON ui.id_insignia = i.id_insignia
      WHERE ui.id_usuario = ?
      ORDER BY ui.fecha_otorgacion DESC;
    `;

    const insignias: InsigniaUsuarioDto[] = await this.dataSource.query(query, [idUsuario]);

    if (!insignias.length) {
      // Puedes decidir si lanzar un error o devolver un array vacío
      // throw new NotFoundException(`No se encontraron insignias para el usuario con ID ${idUsuario}.`);
    }

    return insignias;
  }

  // ==================== CRUD OPERATIONS ====================

  /**
   * CREATE - Crear una nueva insignia
   */
  async create(createInsigniaDto: CreateInsigniaDto): Promise<any> {
    const { nombre, descripcion, imagen_url, criterio } = createInsigniaDto;
    
    const query = `
      INSERT INTO insignia (nombre, descripcion, imagen_url, criterio)
      VALUES (?, ?, ?, ?)
    `;

    const result = await this.dataSource.query(query, [
      nombre, descripcion, imagen_url, criterio
    ]);

    return {
      id_insignia: result.insertId,
      ...createInsigniaDto,
      message: 'Insignia creada exitosamente'
    };
  }

  /**
   * READ ALL - Obtener todas las insignias
   */
  async findAll(): Promise<any[]> {
    const query = `SELECT * FROM insignia ORDER BY id_insignia ASC`;
    return await this.dataSource.query(query);
  }

  /**
   * READ ONE - Obtener una insignia por ID
   */
  async findOne(id_insignia: number): Promise<any> {
    const query = `SELECT * FROM insignia WHERE id_insignia = ?`;
    const insignias = await this.dataSource.query(query, [id_insignia]);

    if (insignias.length === 0) {
      throw new NotFoundException(`Insignia con ID ${id_insignia} no encontrada`);
    }

    return insignias[0];
  }

  /**
   * UPDATE - Actualizar una insignia existente
   */
  async update(id_insignia: number, updateInsigniaDto: UpdateInsigniaDto): Promise<any> {
    // Primero verificar si existe
    await this.findOne(id_insignia);

    const { nombre, descripcion, imagen_url, criterio } = updateInsigniaDto;
    
    // Construir la query dinámicamente basada en los campos proporcionados
    const fields: string[] = [];
    const values: any[] = [];

    if (nombre !== undefined) {
      fields.push('nombre = ?');
      values.push(nombre);
    }
    if (descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(descripcion);
    }
    if (imagen_url !== undefined) {
      fields.push('imagen_url = ?');
      values.push(imagen_url);
    }
    if (criterio !== undefined) {
      fields.push('criterio = ?');
      values.push(criterio);
    }

    if (fields.length === 0) {
      return { message: 'No hay campos para actualizar' };
    }

    values.push(id_insignia);
    
    const query = `
      UPDATE insignia 
      SET ${fields.join(', ')}
      WHERE id_insignia = ?
    `;

    await this.dataSource.query(query, values);

    // Retornar la insignia actualizada
    return await this.findOne(id_insignia);
  }

  /**
   * DELETE - Eliminar una insignia
   */
  async remove(id_insignia: number): Promise<{ message: string }> {
    // Primero verificar si existe
    await this.findOne(id_insignia);

    const query = `DELETE FROM insignia WHERE id_insignia = ?`;
    await this.dataSource.query(query, [id_insignia]);

    return { message: `Insignia con ID ${id_insignia} eliminada exitosamente` };
  }

  // ==================== MÉTODOS ADICIONALES ====================

  /**
   * BÚSQUEDA - Buscar insignias por nombre (opcional)
   */
  async searchByName(nombre: string): Promise<any[]> {
    const query = `
      SELECT * FROM insignia 
      WHERE nombre LIKE ?
      ORDER BY nombre ASC
    `;
    return await this.dataSource.query(query, [`%${nombre}%`]);
  }

  /**
   * CONTAR - Obtener el total de insignias (opcional)
   */
  async count(): Promise<{ total: number }> {
    const query = `SELECT COUNT(*) as total FROM insignia`;
    const result = await this.dataSource.query(query);
    return { total: parseInt(result[0].total) };
  }

  /**
   * ASIGNAR INSIGNIA A USUARIO (opcional - si necesitas esta funcionalidad)
   */
  async asignarInsigniaUsuario(id_usuario: number, id_insignia: number): Promise<any> {
    // Verificar si la insignia existe
    await this.findOne(id_insignia);

    // Verificar si el usuario ya tiene esta insignia
    const checkQuery = `
      SELECT * FROM usuario_insignia 
      WHERE id_usuario = ? AND id_insignia = ?
    `;
    const existing = await this.dataSource.query(checkQuery, [id_usuario, id_insignia]);

    if (existing.length > 0) {
      throw new NotFoundException('El usuario ya tiene esta insignia');
    }

    const query = `
      INSERT INTO usuario_insignia (id_usuario, id_insignia, fecha_otorgacion)
      VALUES (?, ?, NOW())
    `;

    await this.dataSource.query(query, [id_usuario, id_insignia]);

    return {
      message: 'Insignia asignada al usuario exitosamente',
      id_usuario,
      id_insignia,
      fecha_otorgacion: new Date()
    };
  }
}