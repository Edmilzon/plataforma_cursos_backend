import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateInscripcionDto } from './dto/inscripcion.dto';

@Injectable()
export class InscripcionService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createInscripcionDto: CreateInscripcionDto): Promise<any> {
    const { id_curso, id_estudiante, metodo_pago, puntos_utilizados = 0 } = createInscripcionDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const curso = await queryRunner.query('SELECT precio FROM curso WHERE id_curso = ?', [id_curso]);
      if (curso.length === 0) {
        throw new NotFoundException(`El curso con ID ${id_curso} no fue encontrado.`);
      }
      const precioCurso = parseFloat(curso[0].precio || 0);

      const usuario = await queryRunner.query('SELECT saldo_punto FROM usuario WHERE id_usuario = ?', [id_estudiante]);
      if (usuario.length === 0) {
        throw new NotFoundException(`El estudiante con ID ${id_estudiante} no fue encontrado.`);
      }
      const saldoPuntosUsuario = usuario[0].saldo_punto;

      const inscripcionExistente = await queryRunner.query(
        'SELECT id_inscripcion FROM inscripcion WHERE id_curso = ? AND id_estudiante = ?',
        [id_curso, id_estudiante],
      );
      if (inscripcionExistente.length > 0) {
        throw new BadRequestException('El estudiante ya está inscrito en este curso.');
      }

      const insertInscripcionQuery = `
        INSERT INTO inscripcion (fecha_inscripcion, estado_progreso, porcentaje_completado, id_curso, id_estudiante)
        VALUES (NOW(), 'Inscrito', 0.00, ?, ?)
      `;
      const inscripcionResult = await queryRunner.query(insertInscripcionQuery, [id_curso, id_estudiante]);
      const newInscripcionId = inscripcionResult.insertId;
      
      if (precioCurso === 0) {
        if (puntos_utilizados > 0) {
          throw new BadRequestException('No se pueden utilizar puntos en un curso gratuito.');
        }

        const insertPagoQuery = `
          INSERT INTO pago (monto, descuento_aplicado, puntos_utilizados, fecha_pago, metodo_pago, estado, id_inscripcion)
          VALUES (0.00, 0.00, 0, NOW(), 'Gratis', 'Completado', ?)
        `;
        await queryRunner.query(insertPagoQuery, [newInscripcionId]);
      } else {
        if (!metodo_pago) {
          throw new BadRequestException('Se requiere un método de pago para cursos que no son gratuitos.');
        }

        let descuentoPorPuntos = 0;
        if (puntos_utilizados > 0) {
          if (saldoPuntosUsuario < puntos_utilizados) {
            throw new BadRequestException('No tienes suficientes puntos para realizar este canje.');
          }
          descuentoPorPuntos = puntos_utilizados / 10;
        }

        const montoFinal = Math.max(0, precioCurso - descuentoPorPuntos);

        const insertPagoQuery = `
          INSERT INTO pago (monto, descuento_aplicado, puntos_utilizados, fecha_pago, metodo_pago, estado, id_inscripcion)
          VALUES (?, ?, ?, NOW(), ?, 'Completado', ?)
        `;
        await queryRunner.query(insertPagoQuery, [
          montoFinal,
          descuentoPorPuntos,
          puntos_utilizados,
          metodo_pago,
          newInscripcionId,
        ]);

        if (puntos_utilizados > 0) {
          const nuevoSaldo = saldoPuntosUsuario - puntos_utilizados;
          await queryRunner.query('UPDATE usuario SET saldo_punto = ? WHERE id_usuario = ?', [
            nuevoSaldo,
            id_estudiante,
          ]);
        }
      }

      await queryRunner.commitTransaction();

      const [inscripcionCreada] = await queryRunner.query(
        'SELECT * FROM inscripcion WHERE id_inscripcion = ?',
        [newInscripcionId],
      );
      const [pagoCreado] = await queryRunner.query(
        'SELECT * FROM pago WHERE id_inscripcion = ?',
        [newInscripcionId],
      );

      return {
        message: 'Inscripción realizada con éxito.',
        resultado: {
          ...inscripcionCreada,
          pago: pagoCreado,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al procesar la inscripción.', error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number): Promise<any> {
    const query = 'SELECT * FROM inscripcion WHERE id_inscripcion = ?';
    const result = await this.dataSource.query(query, [id]);
    if (result.length === 0) {
      throw new NotFoundException(`La inscripción con ID ${id} no fue encontrada.`);
    }
    return result[0];
  }

  async findAllByStudent(id_estudiante: number): Promise<any[]> {
    const query = `
      SELECT i.*, c.titulo as titulo_curso
      FROM inscripcion i
      JOIN curso c ON i.id_curso = c.id_curso
      WHERE i.id_estudiante = ?
    `;
    return this.dataSource.query(query, [id_estudiante]);
  }
}
