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

    const curso = result[0];

    const horariosQuery = `
      SELECT 
          dia_semana, 
          TIME_FORMAT(hora_inicio, "%H:%i") as hora_inicio, 
          TIME_FORMAT(hora_fin, "%H:%i") as hora_fin 
        FROM horario 
        WHERE id_curso = ?
      `;
      const horarios = await this.dataSource.query(horariosQuery, [id]);
      const horarioTexto = horarios.length > 0 
      ? horarios.map((h: any) => `${h.dia_semana} ${h.hora_inicio} - ${h.hora_fin}`).join(', ')
      : 'Horario por definir';

      return { ...curso, horario_clases: horarioTexto };
  }

  async findAllByDocente(docenteId: number): Promise<Curso[]> {
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
      WHERE c.id_docente = ?;
    `;
    return this.dataSource.query(query, [docenteId]);
  }

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

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    const query = `DELETE FROM curso WHERE id_curso = ?`;
    await this.dataSource.query(query, [id]);
  }

  async createModulo(moduloData: CreateModuloDto) {
    await this.findOne(moduloData.id_curso); 
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
    await this.findOne(cursoId);
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
    await this.findOne(horarioData.id_curso);
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
    await this.findOne(cursoId); 
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

  async getTasksByCourse(idCurso: number) {
    const query = `
      SELECT 
        id_tarea,
        nombre,
        descripcion,
        fecha_limite,
        fecha_creacion
      FROM tarea
      WHERE id_curso = ?
    `;

    const result = await this.dataSource.query(query, [idCurso]);
    return result;
  }

  async getReporteEstadoEstudiantes() {
    const query = `
      SELECT 
        c.id_curso,
        c.titulo AS curso_titulo,
        u.id_usuario AS id_estudiante,
        CONCAT(u.nombre, ' ', u.apellido) AS estudiante_nombre_completo,
        i.estado_progreso,
        i.porcentaje_completado,
        i.fecha_inscripcion
      FROM inscripcion i
      JOIN usuario u ON i.id_estudiante = u.id_usuario
      JOIN curso c ON i.id_curso = c.id_curso
      ORDER BY c.titulo, i.fecha_inscripcion;
    `;
    const reporte = await this.dataSource.query(query);
    return reporte;
  }
}