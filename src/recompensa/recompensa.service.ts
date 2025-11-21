import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
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

    // 1. Validar que la recompensa existe
    const recompensaQuery = `SELECT * FROM recompensa WHERE id_recompensa = ?`;
    const recompensaResult = await this.dataSource.query(recompensaQuery, [
      recompensaId,
    ]);

    if (recompensaResult.length === 0) {
      throw new NotFoundException(
        `La recompensa con ID ${recompensaId} no fue encontrada.`,
      );
    }
    const recompensa = recompensaResult[0];

    // 2. Insertar en la tabla de canjes (el trigger se encargará de la lógica)
    const insertQuery = `INSERT INTO canje_recompensa (id_usuario, id_recompensa, fecha_canje, puntos_utilizados) VALUES (?, ?, NOW(), ?)`;
    await this.dataSource.query(insertQuery, [
      id_usuario,
      recompensaId,
      recompensa.puntos_requeridos,
    ]);

    return { message: 'Recompensa canjeada exitosamente.' };
  }
}