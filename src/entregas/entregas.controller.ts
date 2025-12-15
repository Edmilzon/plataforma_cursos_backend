import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { EntregasService } from './entregas.service';
import { CalificarEntregaDto, CreateEntregaDto } from './dto/entrega.dto';

@Controller('entregas')
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEntregaDto: CreateEntregaDto) {
    return this.entregasService.create(createEntregaDto);
  }

  @Get('progreso/:id_usuario/:id_leccion')
  getProgreso(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_leccion', ParseIntPipe) id_leccion: number,
  ) {
    return this.entregasService.getProgreso(id_usuario, id_leccion);
  }

  @Patch(':id/calificar')
  calificar(
    @Param('id', ParseIntPipe) id: number,
    @Body() calificarEntregaDto: CalificarEntregaDto,
  ) {
    return this.entregasService.calificar(id, calificarEntregaDto);
  }

  @Get('/tarea/:idTarea')
  async getDeliveriesByTask(@Param('idTarea') idTarea: string) {
  return this.entregasService.getDeliveriesByTask(Number(idTarea));
  }

  @Get('certificado/validar')
  async validarCertificado(
    @Query('usuario') idUsuario: number,
    @Query('curso') idCurso: number,
  ) {
    // Nota: Los parámetros de @Query suelen llegar como strings.
    // Si tu base de datos es MySQL, esto suele funcionar directo.
    // Si necesitas convertirlos estrictamente, usa: @Query('usuario', ParseIntPipe)
    return this.entregasService.obtenerCertificado(idUsuario, idCurso);
  }

}