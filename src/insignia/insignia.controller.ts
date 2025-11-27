import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InsigniaService } from './insignia.service';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { InsigniaUsuarioDto } from './dto/insignia.dto'; // La ruta ya era correcta

@ApiTags('Insignias')
@Controller('insignias')
export class InsigniaController {
  constructor(private readonly insigniaService: InsigniaService) {}

  @Get('usuario/:idUsuario')
  @ApiOperation({
    summary: 'Obtener las insignias de un usuario',
    description: 'Devuelve una lista de todas las insignias obtenidas por un usuario específico.',
  })
  @ApiParam({ name: 'idUsuario', description: 'El ID del usuario', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Lista de insignias del usuario recuperada exitosamente.',
    type: [InsigniaUsuarioDto],
  })
  findInsigniasByUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
  ): Promise<InsigniaUsuarioDto[]> {
    return this.insigniaService.findInsigniasByUsuario(idUsuario);
  }
}