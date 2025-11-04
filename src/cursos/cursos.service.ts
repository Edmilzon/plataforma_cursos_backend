import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Curso } from './interface/curso.interface';
import {
  CreateCursoDto,
  CreateEvaluacionDto,
  CreateHorarioDto,
  CreateModuloDto,
  CreateTareaDto,
  UpdateEvaluacionDto,
  UpdateHorarioDto,
  UpdateModuloDto,
  UpdateCursoDto,
} from './dto/cursos.dto';

@Injectable()
export class CursosService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene todos los cursos de la base de datos.
   * Une las tablas de curso, usuario (docente) y tipo_curso.
   */
  async findAll(): Promise<Curso[]> {
    const query = `
      SELECT
        c.id_curso,
        c.titulo,
        c.descripcion,
        c.fecha_inicio,
        c.fecha_fin,
        c.duracion,
        c.precio,
        c.modalidad,
        JSON_OBJECT('id_usuario', u.id_usuario, 'nombre', u.nombre, 'apellido', u.apellido) as docente,
        JSON_OBJECT('id_tipo_curso', tc.id_tipo_curso, 'nombre', tc.nombre) as tipo_curso
      FROM curso c
      JOIN usuario u ON c.id_docente = u.id_usuario
      JOIN tipo_curso tc ON c.id_tipo_curso = tc.id_tipo_curso;
    `;
    const cursos = await this.dataSource.query(query);
    return cursos;
  }

  /**
   * Busca y obtiene un curso específico por su ID.
   * @param id - El ID del curso a buscar.
   */
  async findOne(id: number): Promise<Curso> {
    const query = `
      SELECT
        c.id_curso,
        c.titulo,
        c.descripcion,
        c.fecha_inicio,
        c.fecha_fin,
        c.duracion,
        c.precio,
        c.modalidad,
        JSON_OBJECT('id_usuario', u.id_usuario, 'nombre', u.nombre, 'apellido', u.apellido) as docente,
        JSON_OBJECT('id_tipo_curso', tc.id_tipo_curso, 'nombre', tc.nombre) as tipo_curso
      FROM curso c
      JOIN usuario u ON c.id_docente = u.id_usuario
      JOIN tipo_curso tc ON c.id_tipo_curso = tc.id_tipo_curso
      WHERE c.id_curso = ?;
    `;
    const result = await this.dataSource.query(query, [id]);

    if (result.length === 0) {
      throw new NotFoundException(`El curso con ID ${id} no fue encontrado.`);
    }

    return result[0];
  }

  /**
   * Crea un nuevo curso en la base de datos.
   * @param cursoData - Los datos para crear el curso.
   */
  async create(cursoData: CreateCursoDto): Promise<any> {
    const fields = [
      'titulo', 'descripcion', 'fecha_inicio', 'fecha_fin', 'duracion', 
      'precio', 'modalidad', 'id_docente', 'id_tipo_curso'
    ];
    const values = [
      cursoData.titulo, cursoData.descripcion, cursoData.fecha_inicio, cursoData.fecha_fin,
      cursoData.duracion, cursoData.precio, cursoData.modalidad, cursoData.id_docente,
      cursoData.id_tipo_curso
    ];

    if (cursoData.cupo !== undefined) {
      fields.push('cupo');
      values.push(cursoData.cupo);
    }

    if (cursoData.imagen_portada_url) {
      fields.push('imagen_portada_url');
      values.push(cursoData.imagen_portada_url);
    }

    const setClause = fields.join(', ');
    const placeholders = fields.map(() => '?').join(', ');

    const query = `INSERT INTO curso (${setClause}) VALUES (${placeholders});`;
    const result = await this.dataSource.query(query, values);
    
    return this.findOne(result.insertId);
  }

  /**
   * Actualiza un curso existente.
   * @param id - El ID del curso a actualizar.
   * @param cursoData - Los datos a actualizar.
   */
  async update(id: number, cursoData: UpdateCursoDto): Promise<any> {
    const fields = Object.keys(cursoData);
    const values = Object.values(cursoData);

    if (fields.length === 0) {
      return this.findOne(id);
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE curso SET ${setClause} WHERE id_curso = ?`;

    await this.dataSource.query(query, [...values, id]);
    return this.findOne(id);
  }

  /**
   * Elimina un curso por su ID.
   * @param id - El ID del curso a eliminar.
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verifica si el curso existe
    const query = `DELETE FROM curso WHERE id_curso = ?`;
    await this.dataSource.query(query, [id]);
  }

  // --- Métodos CRUD para otras entidades (Módulo, Tarea, etc.) ---
  // Estos métodos son ejemplos. Deberías crear servicios y controladores separados para ellos
  // para una mejor organización a medida que la aplicación crece.

  async createModulo(moduloData: CreateModuloDto) {
    await this.findOne(moduloData.id_curso); // Verifica que el curso exista
    const query = `INSERT INTO modulo (nombre, descripcion, orden, id_curso) VALUES (?, ?, ?, ?)`;
    const result = await this.dataSource.query(query, [
      moduloData.nombre,
      moduloData.descripcion,
      moduloData.orden,
      moduloData.id_curso,
    ]);
    return { id_modulo: result.insertId, ...moduloData };
  }

  async findAllModulosByCurso(cursoId: number) {
    await this.findOne(cursoId); // Verifica que el curso exista
    const query = `SELECT * FROM modulo WHERE id_curso = ?`;
    return this.dataSource.query(query, [cursoId]);
  }

  async findOneModulo(id: number) {
    const query = `SELECT * FROM modulo WHERE id_modulo = ?`;
    const result = await this.dataSource.query(query, [id]);
    if (result.length === 0) {
      throw new NotFoundException(`El módulo con ID ${id} no fue encontrado.`);
    }
    return result[0];
  }

  async updateModulo(id: number, moduloData: UpdateModuloDto) {
    await this.findOneModulo(id);
    const fields = Object.keys(moduloData);
    if (fields.length === 0) return this.findOneModulo(id);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE modulo SET ${setClause} WHERE id_modulo = ?`;
    await this.dataSource.query(query, [...Object.values(moduloData), id]);
    return this.findOneModulo(id);
  }

  async removeModulo(id: number) {
    await this.findOneModulo(id);
    const query = `DELETE FROM modulo WHERE id_modulo = ?`;
    await this.dataSource.query(query, [id]);
  }

  async createTarea(tareaData: CreateTareaDto) {
    // Aquí deberíamos verificar que la lección (id_leccion) existe.
    const query = `INSERT INTO tarea (titulo, descripcion, url_contenido, fecha_entrega, id_leccion) VALUES (?, ?, ?, ?, ?)`;
    const result = await this.dataSource.query(query, [
      tareaData.titulo,
      tareaData.descripcion,
      tareaData.url_contenido,
      tareaData.fecha_entrega,
      tareaData.id_leccion,
    ]);
    return { id_tarea: result.insertId, ...tareaData };
  }

  async createEvaluacion(evaluacionData: CreateEvaluacionDto) {
    // Aquí deberíamos verificar que la lección (id_leccion) existe.
    const query = `INSERT INTO evaluacion (titulo, descripcion, tipo, fecha_hora_inicio, fecha_hora_entrega, calificacion_maxima, id_leccion) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await this.dataSource.query(
      query,
      Object.values(evaluacionData),
    );
    return { id_evaluacion: result.insertId, ...evaluacionData };
  }

  async findOneEvaluacion(id: number) {
    const query = `SELECT * FROM evaluacion WHERE id_evaluacion = ?`;
    const result = await this.dataSource.query(query, [id]);
    if (result.length === 0) {
      throw new NotFoundException(`La evaluación con ID ${id} no fue encontrada.`);
    }
    return result[0];
  }

  async updateEvaluacion(id: number, evaluacionData: UpdateEvaluacionDto) {
    await this.findOneEvaluacion(id);
    const fields = Object.keys(evaluacionData);
    if (fields.length === 0) return this.findOneEvaluacion(id);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE evaluacion SET ${setClause} WHERE id_evaluacion = ?`;
    await this.dataSource.query(query, [...Object.values(evaluacionData), id]);
    return this.findOneEvaluacion(id);
  }

  async removeEvaluacion(id: number) {
    await this.findOneEvaluacion(id);
    const query = `DELETE FROM evaluacion WHERE id_evaluacion = ?`;
    await this.dataSource.query(query, [id]);
  }

  async createHorario(horarioData: CreateHorarioDto) {
    await this.findOne(horarioData.id_curso); // Verifica que el curso exista
    const query = `INSERT INTO horario (dia_semana, hora_inicio, hora_fin, id_curso) VALUES (?, ?, ?, ?)`;
    const result = await this.dataSource.query(query, [
      horarioData.dia_semana,
      horarioData.hora_inicio,
      horarioData.hora_fin,
      horarioData.id_curso,
    ]);
    return this.findOneHorario(result.insertId);
  }

  async findAllHorariosByCurso(cursoId: number) {
    await this.findOne(cursoId); // Verifica que el curso exista
    const query = `SELECT * FROM horario WHERE id_curso = ?`;
    return this.dataSource.query(query, [cursoId]);
  }

  async findOneHorario(id: number) {
    const query = `SELECT * FROM horario WHERE id_horario = ?`;
    const result = await this.dataSource.query(query, [id]);
    if (result.length === 0) {
      throw new NotFoundException(`El horario con ID ${id} no fue encontrado.`);
    }
    return result[0];
  }

  async updateHorario(id: number, horarioData: UpdateHorarioDto) {
    await this.findOneHorario(id);
    const fields = Object.keys(horarioData);
    if (fields.length === 0) return this.findOneHorario(id);
    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const query = `UPDATE horario SET ${setClause} WHERE id_horario = ?`;
    await this.dataSource.query(query, [...Object.values(horarioData), id]);
    return this.findOneHorario(id);
  }

  async removeHorario(id: number) {
    await this.findOneHorario(id);
    const query = `DELETE FROM horario WHERE id_horario = ?`;
    await this.dataSource.query(query, [id]);
  }
}