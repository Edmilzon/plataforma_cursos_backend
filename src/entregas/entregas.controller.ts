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
}