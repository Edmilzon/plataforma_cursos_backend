import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateEntregaDto, CalificarEntregaDto } from './dto/entrega.dto';

@Injectable()
export class EntregasService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createEntregaDto: CreateEntregaDto): Promise<any> {
    const { id_usuario, id_tarea, id_evaluacion, url_archivo } = createEntregaDto;

    if ((!id_tarea && !id_evaluacion) || (id_tarea && id_evaluacion)) {
      throw new BadRequestException(
        'Debe proporcionar un id_tarea o un id_evaluacion, pero no ambos.',
      );
    }

    if (id_tarea && !url_archivo) {
      throw new BadRequestException('La url_archivo es obligatoria para la entrega de tareas.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const usuario = await queryRunner.query('SELECT id_usuario FROM usuario WHERE id_usuario = ?', [id_usuario]);
      if (usuario.length === 0) {
        throw new NotFoundException(`El usuario con ID ${id_usuario} no fue encontrado.`);
      }

      let id_curso: number;
      let id_leccion: number;

      if (id_tarea) {
        const tareaInfo = await queryRunner.query(
          `SELECT l.id_modulo, t.id_leccion FROM tarea t JOIN leccion l ON t.id_leccion = l.id_leccion WHERE t.id_tarea = ?`,
          [id_tarea],
        );
        if (tareaInfo.length === 0) throw new NotFoundException(`La tarea con ID ${id_tarea} no fue encontrada.`);
        
        id_leccion = tareaInfo[0].id_leccion;
        const cursoInfo = await queryRunner.query(
            `SELECT m.id_curso FROM modulo m WHERE m.id_modulo = ?`, [tareaInfo[0].id_modulo]
        );
        id_curso = cursoInfo[0].id_curso;

      } else { 
        const evaluacionInfo = await queryRunner.query(
          `SELECT l.id_modulo, e.id_leccion FROM evaluacion e JOIN leccion l ON e.id_leccion = l.id_leccion WHERE e.id_evaluacion = ?`,
          [id_evaluacion],
        );
        if (evaluacionInfo.length === 0) throw new NotFoundException(`La evaluación con ID ${id_evaluacion} no fue encontrada.`);

        id_leccion = evaluacionInfo[0].id_leccion;
        const cursoInfo = await queryRunner.query(
            `SELECT m.id_curso FROM modulo m WHERE m.id_modulo = ?`, [evaluacionInfo[0].id_modulo]
        );
        id_curso = cursoInfo[0].id_curso;
      }

      const inscripcion = await queryRunner.query(
        'SELECT id_inscripcion FROM inscripcion WHERE id_estudiante = ? AND id_curso = ?',
        [id_usuario, id_curso],
      );
      if (inscripcion.length === 0) {
        throw new BadRequestException('El estudiante no está inscrito en el curso de esta actividad.');
      }

      const entregaExistente = await queryRunner.query(
        'SELECT id_entrega FROM entrega_actividad WHERE id_usuario = ? AND (id_tarea = ? OR id_evaluacion = ?)',
        [id_usuario, id_tarea || null, id_evaluacion || null],
      );
      if (entregaExistente.length > 0) {
        throw new BadRequestException('Ya existe una entrega para esta actividad.');
      }

      const insertQuery = `
        INSERT INTO entrega_actividad (id_usuario, id_tarea, id_evaluacion, url_archivo, fecha_entrega, estado, calificacion)
        VALUES (?, ?, ?, ?, NOW(), 'Entregado', NULL)
      `;
      const result = await queryRunner.query(insertQuery, [
        id_usuario,
        id_tarea || null,
        id_evaluacion || null,
        url_archivo || null,
      ]);

      const progresoQuery = `
        INSERT INTO progreso_leccion (id_usuario, id_leccion, completado, fecha_completado)
        VALUES (?, ?, TRUE, NOW())
        ON DUPLICATE KEY UPDATE completado = TRUE, fecha_completado = NOW()
      `;
      await queryRunner.query(progresoQuery, [id_usuario, id_leccion]);
      await queryRunner.commitTransaction();

      return {
        message: 'Actividad entregada con éxito.',
        entrega: {
          id_entrega: result.insertId,
          ...createEntregaDto,
          estado: 'Entregado',
          fecha_entrega: new Date(),
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al procesar la entrega.', error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async getProgreso(id_usuario: number, id_leccion: number): Promise<any> {
    const progreso = await this.dataSource.query(
      'SELECT * FROM progreso_leccion WHERE id_usuario = ? AND id_leccion = ?',
      [id_usuario, id_leccion],
    );

    if (progreso.length > 0) {
      return {
        ...progreso[0],
        completado: !!progreso[0].completado,
      };
    }

    return {
      id_usuario,
      id_leccion,
      completado: false,
      fecha_completado: null,
    };
  }

  async findOne(id: number): Promise<any> {
    const entrega = await this.dataSource.query(
      'SELECT * FROM entrega_actividad WHERE id_entrega = ?',
      [id],
    );
    if (entrega.length === 0) {
      throw new NotFoundException(`La entrega con ID ${id} no fue encontrada.`);
    }
    return entrega[0];
  }

  async calificar(
  id: number,
  calificarEntregaDto: CalificarEntregaDto,
): Promise<any> {
  const entrega = await this.findOne(id);
  const { calificacion } = calificarEntregaDto;
  const MARCA_FINAL = '<!--TRABAJO_FINAL-->'; // MARCA REAL

  // Actualizar calificación
  const query = "UPDATE entrega_actividad SET calificacion = ?, estado = 'Calificado' WHERE id_entrega = ?";
  await this.dataSource.query(query, [calificacion, id]);

  let idCurso = null;
  let esTrabajoFinal = false;

  if (entrega.id_tarea) {
    const tarea = (await this.dataSource.query('SELECT * FROM tarea WHERE id_tarea = ?', [entrega.id_tarea]))[0];
    if (tarea?.descripcion?.includes(MARCA_FINAL)) {
      esTrabajoFinal = true;
      // Buscar ID Curso desde Tarea
      const info = await this.dataSource.query(
        `SELECT m.id_curso FROM tarea t 
         JOIN leccion l ON t.id_leccion = l.id_leccion 
         JOIN modulo m ON l.id_modulo = m.id_modulo 
         WHERE t.id_tarea = ?`, 
        [entrega.id_tarea]
      );
      idCurso = info[0]?.id_curso;
    }
  } else if (entrega.id_evaluacion) {
    const evaluacion = (await this.dataSource.query('SELECT * FROM evaluacion WHERE id_evaluacion = ?', [entrega.id_evaluacion]))[0];
    if (evaluacion?.descripcion?.includes(MARCA_FINAL)) {
      esTrabajoFinal = true;
      // Buscar ID Curso desde Evaluación
      const info = await this.dataSource.query(
        `SELECT m.id_curso FROM evaluacion e 
         JOIN leccion l ON e.id_leccion = l.id_leccion 
         JOIN modulo m ON l.id_modulo = m.id_modulo 
         WHERE e.id_evaluacion = ?`, 
        [entrega.id_evaluacion]
      );
      idCurso = info[0]?.id_curso;
    }
  }

  
  if (esTrabajoFinal && idCurso) {
    const idUsuario = entrega.id_usuario;
    
    // Verificar progreso 100%
    const totalLecciones = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM leccion l 
       JOIN modulo m ON l.id_modulo = m.id_modulo 
       WHERE m.id_curso = ?`, 
      [idCurso]
    );
    const completadas = await this.dataSource.query(
      `SELECT COUNT(DISTINCT pl.id_leccion) as completadas FROM progreso_leccion pl
       JOIN leccion l ON pl.id_leccion = l.id_leccion 
       JOIN modulo m ON l.id_modulo = m.id_modulo
       WHERE pl.id_usuario = ? AND m.id_curso = ? AND pl.completado = 1`, 
      [idUsuario, idCurso]
    );

    // Validar (Nota mínima 60 y 100% progreso)
    const total = parseInt(totalLecciones[0].total);
    const avance = parseInt(completadas[0].completadas);
    
    if (total === avance && calificacion >= 60) {
      const certExistente = await this.dataSource.query(
        'SELECT id_certificado FROM certificado WHERE id_usuario = ? AND id_curso = ?', 
        [idUsuario, idCurso]
      );

      if (certExistente.length === 0) {
        const urlCertificado = `/certificados/ver?curso=${idCurso}&usuario=${idUsuario}`;
        await this.dataSource.query(
          `INSERT INTO certificado (fecha_emision, url_certificado, id_usuario, id_curso) 
           VALUES (NOW(), ?, ?, ?)`,
          [urlCertificado, idUsuario, idCurso]
        );
      }
    }
  }

  
  return await this.findOne(id);
}

  async getDeliveriesByTask(idTarea: number) {
  const query = `
    SELECT 
      e.id_entrega,
      e.url_archivo,
      e.fecha_entrega,
      e.calificacion,
      u.nombre AS nombre_estudiante,
      u.apellido AS apellido_estudiante
    FROM entrega_actividad e
    JOIN usuario u ON u.id_usuario = e.id_usuario
    WHERE e.id_tarea = ?
  `;

  const result = await this.dataSource.query(query, [idTarea]);

  // Combinar nombres en un solo campo
  return result.map(r => ({
    ...r,
    nombre_estudiante: `${r.nombre_estudiante} ${r.apellido_estudiante}`,
  }));
  }

  async obtenerCertificado(idUsuario: number, idCurso: number) {
    const result = await this.dataSource.query(
      'SELECT * FROM certificado WHERE id_usuario = ? AND id_curso = ?',
      [idUsuario, idCurso],
    );
    
    if (result.length > 0) {
      return { tiene_certificado: true, url: result[0].url_certificado };
    }
    return { tiene_certificado: false, url: null };
  }
}