import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { CreateInscripcionDto } from './dto/inscripcion.dto';

@Injectable()
export class InscripcionService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createInscripcionDto: CreateInscripcionDto): Promise<any> {
    const { 
      id_curso, 
      id_estudiante, 
      metodo_pago,
      id_canje_recompensa
    } = createInscripcionDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar que el curso existe
      const curso = await queryRunner.query('SELECT precio FROM curso WHERE id_curso = ?', [id_curso]);
      if (curso.length === 0) {
        throw new NotFoundException(`El curso con ID ${id_curso} no fue encontrado.`);
      }
      const precioCurso = parseFloat(curso[0].precio || 0);

      // 2. Validar que el usuario existe
      const usuario = await queryRunner.query('SELECT saldo_punto FROM usuario WHERE id_usuario = ?', [id_estudiante]);
      if (usuario.length === 0) {
        throw new NotFoundException(`El estudiante con ID ${id_estudiante} no fue encontrado.`);
      }

      // 3. Validar que no está ya inscrito
      const inscripcionExistente = await queryRunner.query(
        'SELECT id_inscripcion FROM inscripcion WHERE id_curso = ? AND id_estudiante = ?',
        [id_curso, id_estudiante],
      );
      if (inscripcionExistente.length > 0) {
        throw new BadRequestException('El estudiante ya está inscrito en este curso.');
      }

      // 4. VALIDAR RECOMPENSA DE DESCUENTO (si se proporciona)
      let descuentoRecompensa = 0;
      let descuentoPorcentaje = 0;
      let nombreRecompensa = '';
      let idRecompensaUsada = null;
      
      if (id_canje_recompensa) {
        // Verificar que el canje existe, es del usuario y es un descuento disponible
        const canjeValido = await queryRunner.query(`
          SELECT cr.id_canje_recompensa, cr.usado, r.porcentaje_descuento, r.nombre
          FROM canje_recompensa cr
          INNER JOIN recompensa r ON cr.id_recompensa = r.id_recompensa
          WHERE cr.id_canje_recompensa = ? 
          AND cr.id_usuario = ?
          AND cr.usado = 'disponible'
          AND r.porcentaje_descuento IS NOT NULL
          AND r.porcentaje_descuento > 0
        `, [id_canje_recompensa, id_estudiante]);

        if (canjeValido.length === 0) {
          throw new BadRequestException('La recompensa de descuento no es válida o ya fue utilizada.');
        }

        descuentoPorcentaje = parseFloat(canjeValido[0].porcentaje_descuento);
        nombreRecompensa = canjeValido[0].nombre;
        idRecompensaUsada = canjeValido[0].id_canje_recompensa;
        
        // Calcular valor del descuento en dinero
        descuentoRecompensa = precioCurso * (descuentoPorcentaje / 100);
        
        // Validar que el descuento no supere el precio del curso
        if (descuentoRecompensa > precioCurso) {
          descuentoRecompensa = precioCurso;
        }
      }

      // 5. Crear la inscripción
      const insertInscripcionQuery = `
        INSERT INTO inscripcion (fecha_inscripcion, estado_progreso, porcentaje_completado, id_curso, id_estudiante)
        VALUES (NOW(), 'Inscrito', 0.00, ?, ?)
      `;
      const inscripcionResult = await queryRunner.query(insertInscripcionQuery, [id_curso, id_estudiante]);
      const newInscripcionId = inscripcionResult.insertId;
      
      // 6. Procesar según si es curso gratuito o de pago
      if (precioCurso === 0) {
        // CURSO GRATUITO
        if (id_canje_recompensa) {
          throw new BadRequestException('No se puede aplicar descuento en un curso gratuito.');
        }

        // Crear pago gratuito
        const insertPagoQuery = `
          INSERT INTO pago (monto, descuento_aplicado, puntos_utilizados, fecha_pago, metodo_pago, estado, id_inscripcion)
          VALUES (0.00, 0.00, 0, NOW(), 'Gratis', 'Completado', ?)
        `;
        await queryRunner.query(insertPagoQuery, [newInscripcionId]);

        // Registrar en bitácora
        await this.logPago(
          queryRunner,
          id_estudiante,
          newInscripcionId,
          0.0,
          'PAGO_REALIZADO',
          `Inscripción a curso gratuito (ID de curso: ${id_curso}).`,
        );
      } else {
        // CURSO DE PAGO
        if (!metodo_pago) {
          throw new BadRequestException('Se requiere un método de pago para cursos que no son gratuitos.');
        }

        // Calcular monto final (con o sin descuento)
        const montoFinal = Math.max(0, precioCurso - descuentoRecompensa);

        // Crear registro de pago (puntos_utilizados siempre 0)
        const insertPagoQuery = `
          INSERT INTO pago (monto, descuento_aplicado, puntos_utilizados, fecha_pago, metodo_pago, estado, id_inscripcion)
          VALUES (?, ?, 0, NOW(), ?, 'Completado', ?)
        `;
        await queryRunner.query(insertPagoQuery, [
          montoFinal,
          descuentoRecompensa,
          metodo_pago,
          newInscripcionId,
        ]);

        // Marcar recompensa como usada (si aplicó descuento)
        if (id_canje_recompensa && idRecompensaUsada) {
          await queryRunner.query(
            `UPDATE canje_recompensa SET usado = 'usado' WHERE id_canje_recompensa = ?`,
            [idRecompensaUsada]
          );
        }

        // Registrar en bitácora
        const detalleBitacora = id_canje_recompensa ?
          `Pago de $${montoFinal.toFixed(2)} con ${metodo_pago} para el curso ID ${id_curso}. ` +
          `Descuento aplicado: ${descuentoPorcentaje}% ($${descuentoRecompensa.toFixed(2)}) ` +
          `por recompensa "${nombreRecompensa}".` :
          `Pago de $${montoFinal.toFixed(2)} con ${metodo_pago} para el curso ID ${id_curso}. ` +
          `Sin descuento aplicado.`;

        await this.logPago(
          queryRunner,
          id_estudiante,
          newInscripcionId,
          montoFinal,
          'PAGO_REALIZADO',
          detalleBitacora,
        );
      }

      // 7. Confirmar transacción
      await queryRunner.commitTransaction();

      // 8. Obtener datos creados para respuesta
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
      // Revertir transacción en caso de error
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al procesar la inscripción.', error.message);
    } finally {
      await queryRunner.release();
    }
  }

  // Método para obtener descuentos disponibles de un usuario
  async getDescuentosDisponibles(id_estudiante: number): Promise<any[]> {
    const query = `
      SELECT 
        cr.id_canje_recompensa,
        r.nombre,
        r.descripcion,
        r.porcentaje_descuento,
        cr.fecha_canje,
        r.imagen_url,
        r.tipo
      FROM canje_recompensa cr
      INNER JOIN recompensa r ON cr.id_recompensa = r.id_recompensa
      WHERE cr.id_usuario = ?
      AND cr.usado = 'disponible'
      AND r.porcentaje_descuento IS NOT NULL
      AND r.porcentaje_descuento > 0
      ORDER BY r.porcentaje_descuento DESC, cr.fecha_canje ASC
    `;
    
    return this.dataSource.query(query, [id_estudiante]);
  }

  // Método para obtener una inscripción por ID
  async findOne(id: number): Promise<any> {
    const query = 'SELECT * FROM inscripcion WHERE id_inscripcion = ?';
    const result = await this.dataSource.query(query, [id]);
    if (result.length === 0) {
      throw new NotFoundException(`La inscripción con ID ${id} no fue encontrada.`);
    }
    return result[0];
  }

  // Método para obtener todas las inscripciones de un estudiante
  async findAllByStudent(id_estudiante: number): Promise<any[]> {
    const query = `
      SELECT i.*, c.titulo as titulo_curso, c.imagen_portada_url
      FROM inscripcion i
      JOIN curso c ON i.id_curso = c.id_curso
      WHERE i.id_estudiante = ?
      ORDER BY i.fecha_inscripcion DESC
    `;
    return this.dataSource.query(query, [id_estudiante]);
  }

  // Método para registrar en bitácora de pagos
  private async logPago(
    queryRunner: QueryRunner,
    id_usuario: number,
    id_inscripcion: number,
    monto: number,
    accion: string,
    detalle: string,
  ) {
    const query = `
        INSERT INTO bitacora_pagos (id_usuario, id_inscripcion, monto, accion, fecha, detalle)
        VALUES (?, ?, ?, ?, NOW(), ?)
    `;
    try {
      await queryRunner.query(query, [id_usuario, id_inscripcion, monto, accion, detalle]);
    } catch (error) {
      // No relanzamos el error para no interrumpir el flujo principal
      console.error('Error al registrar en la bitácora de pagos:', error);
    }
  }
}