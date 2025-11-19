import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateEntregaDto } from './dto/entrega.dto';

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

      if (id_tarea) {
        const tareaInfo = await queryRunner.query(
          `SELECT l.id_modulo FROM tarea t JOIN leccion l ON t.id_leccion = l.id_leccion WHERE t.id_tarea = ?`,
          [id_tarea],
        );
        if (tareaInfo.length === 0) throw new NotFoundException(`La tarea con ID ${id_tarea} no fue encontrada.`);
        
        const cursoInfo = await queryRunner.query(
            `SELECT m.id_curso FROM modulo m WHERE m.id_modulo = ?`, [tareaInfo[0].id_modulo]
        );
        id_curso = cursoInfo[0].id_curso;

      } else { 
        const evaluacionInfo = await queryRunner.query(
          `SELECT l.id_modulo FROM evaluacion e JOIN leccion l ON e.id_leccion = l.id_leccion WHERE e.id_evaluacion = ?`,
          [id_evaluacion],
        );
        if (evaluacionInfo.length === 0) throw new NotFoundException(`La evaluación con ID ${id_evaluacion} no fue encontrada.`);

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
}