import { Controller, Post, Body, Get, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';
import { CreateInscripcionDto } from './dto/inscripcion.dto';

@Controller('inscripciones')
export class InscripcionController {
  constructor(private readonly inscripcionService: InscripcionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createInscripcionDto: CreateInscripcionDto) {
    return this.inscripcionService.create(createInscripcionDto);
  }

  @Get('descuentos-disponibles/:id')
  getDescuentosDisponibles(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionService.getDescuentosDisponibles(id);
  }

  @Get('estudiante/:id')
  findAllByStudent(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionService.findAllByStudent(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionService.findOne(id);
  }
}