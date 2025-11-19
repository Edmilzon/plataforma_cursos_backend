import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { EntregasService } from './entregas.service';
import { CreateEntregaDto } from './dto/entrega.dto';

@Controller('entregas')
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createEntregaDto: CreateEntregaDto) {
    return this.entregasService.create(createEntregaDto);
  }
}