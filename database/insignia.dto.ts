import { ApiProperty } from '@nestjs/swagger';

export class InsigniaUsuarioDto {
  @ApiProperty({ example: 1, description: 'ID de la insignia' })
  id_insignia: number;

  @ApiProperty({ example: 'Maestro del Saber', description: 'Nombre de la insignia' })
  nombre: string;

  @ApiProperty({ example: 'Otorgada por completar 5 cursos.', description: 'Descripción de la insignia' })
  descripcion: string;

  @ApiProperty({ example: 'https://example.com/images/maestro.png', description: 'URL de la imagen de la insignia' })
  imagen_url: string;

  @ApiProperty({ example: '2024-05-21T10:00:00.000Z', description: 'Fecha en que el usuario obtuvo la insignia' })
  fecha_otorgacion: Date;
}