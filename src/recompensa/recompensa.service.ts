import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { CanjearRecompensaDto } from './dto/recompensa.dto';

@Injectable()
export class RecompensaService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async findAll() {
    const query = `SELECT * FROM recompensa WHERE estado = 'Activo' AND cantidad_disponible > 0;`;
    return this.dataSource.query(query);
  }

  async canjear(
    recompensaId: number,
    canjearRecompensaDto: CanjearRecompensaDto,
  ) {
    const { id_usuario } = canjearRecompensaDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Validar que la recompensa existe
      const recompensaQuery = `SELECT * FROM recompensa WHERE id_recompensa = ? FOR UPDATE`;
      const recompensaResult = await queryRunner.query(recompensaQuery, [recompensaId]);

      if (recompensaResult.length === 0) {
        throw new NotFoundException(`La recompensa con ID ${recompensaId} no fue encontrada.`);
      }
      const recompensa = recompensaResult[0];

      // 2. Insertar en la tabla de canjes (el trigger se encargará de la lógica de validación y actualización)
      const insertQuery = `INSERT INTO canje_recompensa (id_usuario, id_recompensa, fecha_canje, puntos_utilizados) VALUES (?, ?, NOW(), ?)`;
      await queryRunner.query(insertQuery, [
        id_usuario,
        recompensaId,
        recompensa.puntos_requeridos,
      ]);

      // 3. Registrar en la bitácora de recompensas
      await this.logRecompensa(
        queryRunner,
        id_usuario,
        recompensaId,
        'CANJE',
        recompensa.puntos_requeridos,
        `Canje exitoso de la recompensa '${recompensa.nombre}'.`,
      );

      await queryRunner.commitTransaction();
      return { message: 'Recompensa canjeada exitosamente.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Registrar el error en la bitácora
      let detalleError = 'Error desconocido durante el canje.';
      if (error instanceof NotFoundException) {
        detalleError = error.message;
      } else if (error.message.includes('Puntos insuficientes')) {
        detalleError = `Intento de canje fallido: Puntos insuficientes.`;
      } else if (error.message.includes('No hay stock')) {
        detalleError = `Intento de canje fallido: Recompensa agotada.`;
      }

      await this.logRecompensa(
        this.dataSource.createQueryRunner(), // Usar un nuevo queryRunner para no interferir con la transacción fallida
        id_usuario,
        recompensaId,
        'ERROR',
        0,
        detalleError,
      );

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      // Para errores de trigger (SQLSTATE 45000) u otros errores de BD
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async logRecompensa(
    queryRunner: QueryRunner,
    id_usuario: number,
    id_recompensa: number,
    accion: 'CANJE' | 'ERROR' | 'AGOTADA' | 'DEVUELTA',
    puntos_utilizados: number,
    detalle: string,
  ) {
    const query = `
      INSERT INTO bitacora_recompensas (id_usuario, id_recompensa, accion, puntos_utilizados, fecha, detalle)
      VALUES (?, ?, ?, ?, NOW(), ?)
    `;
    try {
      await queryRunner.query(query, [id_usuario, id_recompensa, accion, puntos_utilizados, detalle]);
    } catch (error) {
      console.error('Error al registrar en la bitácora de recompensas:', error);
    } finally {
      if (!queryRunner.isTransactionActive) {
        await queryRunner.release();
      }
    }
  }
}