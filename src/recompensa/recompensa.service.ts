import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import {
  CanjearRecompensaDto,
  CreateRecompensaDto,
  UpdateRecompensaDto,
} from './dto/recompensa.dto';

@Injectable()
export class RecompensaService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

<<<<<<< HEAD
  async create(createRecompensaDto: CreateRecompensaDto) {
    const {
      nombre,
      descripcion,
      tipo,
      puntos_requeridos,
      cantidad_disponible,
      estado,
      imagen_url,
    } = createRecompensaDto;
    const query = `
      INSERT INTO recompensa (nombre, descripcion, tipo, puntos_requeridos, cantidad_disponible, estado, imagen_url)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
    try {
      const result = await this.dataSource.query(query, [
        nombre,
        descripcion,
        tipo,
        puntos_requeridos,
        cantidad_disponible,
        estado,
        imagen_url,
      ]);
      return { id_recompensa: result.insertId, ...createRecompensaDto };
    } catch (error) {
      throw new BadRequestException(`Error al crear la recompensa: ${error.message}`);
    }
=======
  async findRedeemedByUser(userId: number) {
    const query = `
      SELECT r.*, cr.fecha_canje, cr.id_canje_recompensa
      FROM canje_recompensa cr
      JOIN recompensa r ON cr.id_recompensa = r.id_recompensa
      WHERE cr.id_usuario = ?
      ORDER BY cr.fecha_canje DESC
    `;
    return this.dataSource.query(query, [userId]);
>>>>>>> origin/ajustes-pago
  }

  async findAll() {
    // Vista para administradores, trae todo
    const query = `SELECT * FROM recompensa;`;
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

  async findAllActive() {
    // Vista para usuarios, solo recompensas canjeables
    const query = `SELECT * FROM recompensa WHERE estado = 'Activo' AND cantidad_disponible > 0;`;
    return this.dataSource.query(query);
  }

  async findOne(id: number) {
    const recompensa = await this.dataSource.query(
      'SELECT * FROM recompensa WHERE id_recompensa = ?',
      [id],
    );
    if (recompensa.length === 0) {
      throw new NotFoundException(`Recompensa con ID ${id} no encontrada.`);
    }
    return recompensa[0];
  }

  async update(id: number, updateRecompensaDto: UpdateRecompensaDto) {
    const fields = Object.keys(updateRecompensaDto);
    if (fields.length === 0) {
      throw new BadRequestException('No se proporcionaron datos para actualizar.');
    }

    const setClause = fields.map((field) => `${field} = ?`).join(', ');
    const values = fields.map((field) => updateRecompensaDto[field]);

    const query = `UPDATE recompensa SET ${setClause} WHERE id_recompensa = ?`;

    try {
      const result = await this.dataSource.query(query, [...values, id]);
      if (result.affectedRows === 0) {
        throw new NotFoundException(`Recompensa con ID ${id} no encontrada.`);
      }
      return this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(`Error al actualizar la recompensa: ${error.message}`);
    }
  }

  async remove(id: number) {
    // Soft delete
    const query = `UPDATE recompensa SET estado = 'Inactivo' WHERE id_recompensa = ?`;
    try {
      const result = await this.dataSource.query(query, [id]);
      if (result.affectedRows === 0) {
        throw new NotFoundException(`Recompensa con ID ${id} no encontrada.`);
      }
      return { message: `Recompensa con ID ${id} ha sido desactivada.` };
    } catch (error) {
      throw new BadRequestException(`Error al desactivar la recompensa: ${error.message}`);
    }
  }
}