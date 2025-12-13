import { ApiProperty } from '@nestjs/swagger';

export class CreateInsigniaDto {
  @ApiProperty({ example: 'Maestro del Saber', description: 'Nombre de la insignia' })
  nombre: string;

  @ApiProperty({ example: 'Otorgada por completar 5 cursos.', description: 'Descripción de la insignia' })
  descripcion: string;

  @ApiProperty({ example: 'https://example.com/images/maestro.png', description: 'URL de la imagen' })
  imagen_url: string;

  @ApiProperty({ example: 'Completar al menos 5 cursos', description: 'Criterio para obtener la insignia' })
  criterio: string;
}

export class UpdateInsigniaDto {
  @ApiProperty({ example: 'Maestro del Conocimiento', description: 'Nombre de la insignia', required: false })
  nombre?: string;

  @ApiProperty({ example: 'Otorgada por completar 6 cursos.', description: 'Descripción de la insignia', required: false })
  descripcion?: string;

  @ApiProperty({ example: 'https://example.com/images/maestro2.png', description: 'URL de la imagen', required: false })
  imagen_url?: string;

  @ApiProperty({ example: 'Completar al menos 6 cursos', description: 'Criterio para obtener la insignia', required: false })
  criterio?: string;
}