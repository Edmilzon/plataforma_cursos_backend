import { Injectable, NotFoundException } from '@nestjs/common';
import { InsigniaUsuarioDto } from './dto/insignia.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class InsigniaService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Obtiene todas las insignias que ha ganado un usuario específico.
   * @param idUsuario - El ID del usuario.
   * @returns Un arreglo de insignias del usuario.
   */
  async findInsigniasByUsuario(
    idUsuario: number,
  ): Promise<InsigniaUsuarioDto[]> {
    const query = `
      SELECT 
        i.id_insignia,
        i.nombre,
        i.descripcion,
        i.imagen_url,
        ui.fecha_otorgacion
      FROM usuario_insignia ui
      JOIN insignia i ON ui.id_insignia = i.id_insignia
      WHERE ui.id_usuario = ?
      ORDER BY ui.fecha_otorgacion DESC;
    `;

    const insignias: InsigniaUsuarioDto[] = await this.dataSource.query(query, [
      idUsuario,
    ]);

    if (!insignias.length) {
      // Opcional: puedes decidir si lanzar un error o devolver un array vacío.
      // throw new NotFoundException(`No se encontraron insignias para el usuario con ID ${idUsuario}.`);
    }

    return insignias;
  }
}