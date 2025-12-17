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
    const entrega = await this.findOne(id); // Verifica que la entrega exista y la obtiene
    const { calificacion } = calificarEntregaDto;

    const query =
      "UPDATE entrega_actividad SET calificacion = ?, estado = 'Calificado' WHERE id_entrega = ?";
    await this.dataSource.query(query, [calificacion, id]);

    // Devuelve el objeto que ya teníamos, pero con la calificación y estado actualizados.
    // Así evitamos una segunda consulta a la base de datos.
    return {
      ...entrega,
      calificacion,
      estado: 'Calificado',
    };
  }

  async findAllByCurso(id_curso: number): Promise<any[]> {
    // Primero, verificamos si el curso existe para dar un error claro.
    const curso = await this.dataSource.query('SELECT id_curso FROM curso WHERE id_curso = ?', [id_curso]);
    if (curso.length === 0) {
      throw new NotFoundException(`El curso con ID ${id_curso} no fue encontrado.`);
    }

    const query = `
      SELECT
          ea.id_entrega,
          ea.id_usuario,
          u.nombre AS nombre_usuario,
          u.apellido AS apellido_usuario,
          l.id_leccion,
          l.titulo AS titulo_leccion,
          COALESCE(t.id_tarea, ev.id_evaluacion) AS id_actividad,
          COALESCE(t.titulo, ev.titulo) AS titulo_actividad,
          IF(t.id_tarea IS NOT NULL, 'Tarea', 'Evaluacion') AS tipo_actividad,
          ea.calificacion,
          ea.url_archivo,
          ea.fecha_entrega,
          ea.estado
      FROM entrega_actividad ea
      JOIN usuario u ON ea.id_usuario = u.id_usuario
      LEFT JOIN tarea t ON ea.id_tarea = t.id_tarea
      LEFT JOIN evaluacion ev ON ea.id_evaluacion = ev.id_evaluacion
      -- Usamos COALESCE para obtener el id_leccion de la tabla que no sea nula
      JOIN leccion l ON l.id_leccion = COALESCE(t.id_leccion, ev.id_leccion)
      JOIN modulo m ON l.id_modulo = m.id_modulo
      WHERE m.id_curso = ?
      ORDER BY ea.fecha_entrega DESC;
    `;

    return this.dataSource.query(query, [id_curso]);
  }

  async findAllByUsuarioAndCurso(
    id_usuario: number,
    id_curso: number,
  ): Promise<any[]> {
    // Verificamos que el usuario y el curso existan
    const usuario = await this.dataSource.query('SELECT id_usuario FROM usuario WHERE id_usuario = ?', [id_usuario]);
    if (usuario.length === 0) {
      throw new NotFoundException(`El usuario con ID ${id_usuario} no fue encontrado.`);
    }
    const curso = await this.dataSource.query('SELECT id_curso FROM curso WHERE id_curso = ?', [id_curso]);
    if (curso.length === 0) {
      throw new NotFoundException(`El curso con ID ${id_curso} no fue encontrado.`);
    }

    const query = `
      SELECT
          ea.id_entrega,
          l.id_leccion,
          l.titulo AS titulo_leccion,
          m.nombre AS nombre_modulo,
          COALESCE(t.id_tarea, ev.id_evaluacion) AS id_actividad,
          COALESCE(t.titulo, ev.titulo) AS titulo_actividad,
          IF(t.id_tarea IS NOT NULL, 'Tarea', 'Evaluacion') AS tipo_actividad,
          ea.calificacion,
          ea.url_archivo,
          ea.fecha_entrega,
          ea.estado
      FROM entrega_actividad ea
      JOIN usuario u ON ea.id_usuario = u.id_usuario
      LEFT JOIN tarea t ON ea.id_tarea = t.id_tarea
      LEFT JOIN evaluacion ev ON ea.id_evaluacion = ev.id_evaluacion
      JOIN leccion l ON l.id_leccion = COALESCE(t.id_leccion, ev.id_leccion)
      JOIN modulo m ON l.id_modulo = m.id_modulo
      WHERE m.id_curso = ? AND ea.id_usuario = ?
      ORDER BY m.orden, l.orden;
    `;

    return this.dataSource.query(query, [id_curso, id_usuario]);
  }
}