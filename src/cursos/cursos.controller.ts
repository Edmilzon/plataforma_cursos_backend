import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
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

  @Post()
  async create(@Body() createCursoDto: CreateCursoDto) {
    const curso = await this.cursosService.create(createCursoDto);
    return {
      message: 'Curso creado exitosamente',
      status: 201,
      data: curso,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCursoDto: UpdateCursoDto,
  ) {
    const curso = await this.cursosService.update(id, updateCursoDto);
    return {
      message: `Curso con ID ${id} actualizado correctamente`,
      status: 200,
      data: curso,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.cursosService.remove(id);
    return { message: `Curso con ID ${id} eliminado`, status: 200 };
  }

  // --- Endpoints para Módulos ---

  @Post(':cursoId/modulos')
  async createModulo(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Body() createModuloDto: CreateModuloDto,
  ) {
    // Aseguramos que el módulo se cree para el curso correcto
    createModuloDto.id_curso = cursoId;
    const modulo = await this.cursosService.createModulo(createModuloDto);
    return {
      message: 'Módulo creado exitosamente',
      status: 201,
      data: modulo,
    };
  }

  @Get(':cursoId/modulos')
  async findAllModulosByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    const modulos = await this.cursosService.findAllModulosByCurso(cursoId);
    return {
      message: `Módulos del curso ${cursoId} obtenidos correctamente`,
      status: 200,
      data: modulos,
    };
  }

  @Patch('modulos/:id')
  async updateModulo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModuloDto: UpdateModuloDto,
  ) {
    const modulo = await this.cursosService.updateModulo(id, updateModuloDto);
    return {
      message: `Módulo con ID ${id} actualizado correctamente`,
      status: 200,
      data: modulo,
    };
  }

  @Delete('modulos/:id')
  async removeModulo(@Param('id', ParseIntPipe) id: number) {
    await this.cursosService.removeModulo(id);
    return { message: `Módulo con ID ${id} eliminado`, status: 200 };
  }

  // --- Endpoints para Horarios ---

  @Post(':cursoId/horarios')
  async createHorario(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Body() createHorarioDto: CreateHorarioDto,
  ) {
    createHorarioDto.id_curso = cursoId;
    const horario = await this.cursosService.createHorario(createHorarioDto);
    return {
      message: 'Horario creado exitosamente',
      status: 201,
      data: horario,
    };
  }

  @Get(':cursoId/horarios')
  async findAllHorariosByCurso(
    @Param('cursoId', ParseIntPipe) cursoId: number,
  ) {
    const horarios = await this.cursosService.findAllHorariosByCurso(cursoId);
    return {
      message: `Horarios del curso ${cursoId} obtenidos correctamente`,
      status: 200,
      data: horarios,
    };
  }

  @Patch('horarios/:id')
  async updateHorario(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHorarioDto: UpdateHorarioDto,
  ) {
    const horario = await this.cursosService.updateHorario(id, updateHorarioDto);
    return {
      message: `Horario con ID ${id} actualizado correctamente`,
      status: 200,
      data: horario,
    };
  }

  @Delete('horarios/:id')
  async removeHorario(@Param('id', ParseIntPipe) id: number) {
    await this.cursosService.removeHorario(id);
    return { message: `Horario con ID ${id} eliminado`, status: 200 };
  }

  // NOTA: Los endpoints para Tareas y Evaluaciones se dejarán para sus propios módulos,
  // ya que dependen de 'leccion' y no directamente de 'curso'.
  // Esto mantiene el código más limpio y escalable.
  // Si aún así deseas agregarlos aquí, la lógica sería similar a la de módulos.
}