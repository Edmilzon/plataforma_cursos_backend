import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { CursosService } from './cursos.service';
import {
  CreateCursoDto,
  CreateEvaluacionDto,
  CreateHorarioDto,
  CreateModuloDto,
  UpdateCursoDto,
  UpdateEvaluacionDto,
  UpdateHorarioDto,
  UpdateModuloDto,
} from './dto/cursos.dto';

@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Get()
  async findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findOne(id);
  }

  @Post()
  async create(@Body() createCursoDto: CreateCursoDto) {
    return this.cursosService.create(createCursoDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCursoDto: UpdateCursoDto,
  ) {
    return this.cursosService.update(id, updateCursoDto);
  }

  @Delete(':id')
  @HttpCode(204) // No Content
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.cursosService.remove(id);
  }

  // --- Endpoints para Módulos ---

  @Post(':cursoId/modulos')
  async createModulo(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Body() createModuloDto: CreateModuloDto,
  ) {
    // Aseguramos que el módulo se cree para el curso correcto
    createModuloDto.id_curso = cursoId;
    return this.cursosService.createModulo(createModuloDto);
  }

  @Get(':cursoId/modulos')
  async findAllModulosByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.cursosService.findAllModulosByCurso(cursoId);
  }

  @Patch('modulos/:id')
  async updateModulo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModuloDto: UpdateModuloDto,
  ) {
    return this.cursosService.updateModulo(id, updateModuloDto);
  }

  @Delete('modulos/:id')
  @HttpCode(204)
  async removeModulo(@Param('id', ParseIntPipe) id: number) {
    await this.cursosService.removeModulo(id);
  }

  // --- Endpoints para Horarios ---

  @Post(':cursoId/horarios')
  async createHorario(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Body() createHorarioDto: CreateHorarioDto,
  ) {
    createHorarioDto.id_curso = cursoId;
    return this.cursosService.createHorario(createHorarioDto);
  }

  @Get(':cursoId/horarios')
  async findAllHorariosByCurso(
    @Param('cursoId', ParseIntPipe) cursoId: number,
  ) {
    return this.cursosService.findAllHorariosByCurso(cursoId);
  }

  @Patch('horarios/:id')
  async updateHorario(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHorarioDto: UpdateHorarioDto,
  ) {
    return this.cursosService.updateHorario(id, updateHorarioDto);
  }

  @Delete('horarios/:id')
  @HttpCode(204)
  async removeHorario(@Param('id', ParseIntPipe) id: number) {
    await this.cursosService.removeHorario(id);
  }

  // NOTA: Los endpoints para Tareas y Evaluaciones se dejarán para sus propios módulos,
  // ya que dependen de 'leccion' y no directamente de 'curso'.
  // Esto mantiene el código más limpio y escalable.
  // Si aún así deseas agregarlos aquí, la lógica sería similar a la de módulos.
}