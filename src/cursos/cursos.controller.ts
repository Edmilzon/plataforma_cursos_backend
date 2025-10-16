import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CursosService } from './cursos.service';

@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  async findAll() {
    const cursos = await this.cursosService.findAll();
    return {
      message: 'Cursos obtenidos correctamente',
      status: 200,
      data: cursos,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const curso = await this.cursosService.findOne(id);
    return {
      message: `Curso con ID ${id} obtenido correctamente`,
      status: 200,
      data: curso,
    };
  }
}