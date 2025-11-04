import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CreateLeccionDto,
  UpdateLeccionDto,
  CreateTareaDto,
  UpdateTareaDto,
  CreateEvaluacionDto,
  UpdateEvaluacionDto,
} from './dto/lecciones.dto';

@Injectable()
export class LeccionesService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  // --- Métodos CRUD para Leccion ---

  async create(createLeccionDto: CreateLeccionDto) {
    // Opcional: verificar si el módulo (id_modulo) existe
    const query = `INSERT INTO leccion (titulo, contenido, url_recurso, orden, id_modulo) VALUES (?, ?, ?, ?, ?)`;
    const result = await this.dataSource.query(query, [
      createLeccionDto.titulo,
      createLeccionDto.contenido,
      createLeccionDto.url_recurso,
      createLeccionDto.orden,
      createLeccionDto.id_modulo,
    ]);
    return { id_leccion: result.insertId, ...createLeccionDto };
  }

  async findAllByModulo(moduloId: number) {
    const query = `SELECT * FROM leccion WHERE id_modulo = ? ORDER BY orden`;
    return this.dataSource.query(query, [moduloId]);
  }

  async findOne(id: number) {
    const query = `SELECT * FROM leccion WHERE id_leccion = ?`;
    const result = await this.dataSource.query(query, [id]);
    if (result.length === 0) {
      throw new NotFoundException(`La lección con ID ${id} no fue encontrada.`);
    }
    return result[0];
  }

  async update(id: number, updateLeccionDto: UpdateLeccionDto) {
    await this.findOne(id);
    const fields = Object.keys(updateLeccionDto);
    if (fields.length === 0) return this.findOne(id);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE leccion SET ${setClause} WHERE id_leccion = ?`;
    await this.dataSource.query(query, [...Object.values(updateLeccionDto), id]);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    const query = `DELETE FROM leccion WHERE id_leccion = ?`;
    await this.dataSource.query(query, [id]);
  }

  // --- Métodos CRUD para Tarea ---

  async createTarea(createTareaDto: CreateTareaDto) {
    await this.findOne(createTareaDto.id_leccion); // Verifica que la lección exista
    const query = `INSERT INTO tarea (titulo, descripcion, url_contenido, fecha_entrega, id_leccion) VALUES (?, ?, ?, ?, ?)`;
    const result = await this.dataSource.query(
      query,
      Object.values(createTareaDto),
    );
    return { id_tarea: result.insertId, ...createTareaDto };
  }

  async findAllTareasByLeccion(leccionId: number) {
    await this.findOne(leccionId);
    const query = `SELECT * FROM tarea WHERE id_leccion = ?`;
    return this.dataSource.query(query, [leccionId]);
  }

  async findOneTarea(id: number) {
    const query = `SELECT * FROM tarea WHERE id_tarea = ?`;
    const result = await this.dataSource.query(query, [id]);
    if (result.length === 0) {
      throw new NotFoundException(`La tarea con ID ${id} no fue encontrada.`);
    }
    return result[0];
  }

  async updateTarea(id: number, updateTareaDto: UpdateTareaDto) {
    const tarea = await this.findOneTarea(id);
    const fields = Object.keys(updateTareaDto);
    if (fields.length === 0) return tarea;
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE tarea SET ${setClause} WHERE id_tarea = ?`;
    await this.dataSource.query(query, [...Object.values(updateTareaDto), id]);
    return this.findOneTarea(id);
  }

  async removeTarea(id: number) {
    await this.findOneTarea(id);
    const query = `DELETE FROM tarea WHERE id_tarea = ?`;
    await this.dataSource.query(query, [id]);
  }

  // --- Métodos CRUD para Evaluacion ---

  async createEvaluacion(createEvaluacionDto: CreateEvaluacionDto) {
    await this.findOne(createEvaluacionDto.id_leccion); // Verifica que la lección exista
    const query = `INSERT INTO evaluacion (titulo, descripcion, tipo, fecha_hora_inicio, fecha_hora_entrega, calificacion_maxima, id_leccion) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await this.dataSource.query(
      query,
      Object.values(createEvaluacionDto),
    );
    return { id_evaluacion: result.insertId, ...createEvaluacionDto };
  }

  async findAllEvaluacionesByLeccion(leccionId: number) {
    await this.findOne(leccionId);
    const query = `SELECT * FROM evaluacion WHERE id_leccion = ?`;
    return this.dataSource.query(query, [leccionId]);
  }

  async findOneEvaluacion(id: number) {
    const query = `SELECT * FROM evaluacion WHERE id_evaluacion = ?`;
    const result = await this.dataSource.query(query, [id]);
    if (result.length === 0) {
      throw new NotFoundException(`La evaluación con ID ${id} no fue encontrada.`);
    }
    return result[0];
  }

  async updateEvaluacion(id: number, updateEvaluacionDto: UpdateEvaluacionDto) {
    const evaluacion = await this.findOneEvaluacion(id);
    const fields = Object.keys(updateEvaluacionDto);
    if (fields.length === 0) return evaluacion;
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE evaluacion SET ${setClause} WHERE id_evaluacion = ?`;
    await this.dataSource.query(query, [
      ...Object.values(updateEvaluacionDto),
      id,
    ]);
    return this.findOneEvaluacion(id);
  }

  async removeEvaluacion(id: number) {
    await this.findOneEvaluacion(id);
    const query = `DELETE FROM evaluacion WHERE id_evaluacion = ?`;
    await this.dataSource.query(query, [id]);
  }
}