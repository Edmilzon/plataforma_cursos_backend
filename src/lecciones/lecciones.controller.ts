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
import { LeccionesService } from './lecciones.service';
import {
  CreateLeccionDto,
  UpdateLeccionDto,
  CreateTareaDto,
  UpdateTareaDto,
  CreateEvaluacionDto,
  UpdateEvaluacionDto,
} from './dto/lecciones.dto';

@Controller('lecciones')
export class LeccionesController {
  constructor(private readonly leccionesService: LeccionesService) {}

  // --- Endpoints para Lecciones ---
  // Nota: La creación y listado se hacen desde el módulo de cursos/módulos
  // POST /cursos/modulos/:moduloId/lecciones
  // GET /cursos/modulos/:moduloId/lecciones

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leccionesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeccionDto: UpdateLeccionDto,
  ) {
    return this.leccionesService.update(id, updateLeccionDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.leccionesService.remove(id);
    return { message: `Lección con ID ${id} eliminada`, status: 200 };
  }

  // --- Endpoints para Tareas (anidados en lecciones) ---

  @Post(':leccionId/tareas')
  async createTarea(
    @Param('leccionId', ParseIntPipe) leccionId: number,
    @Body() createTareaDto: CreateTareaDto,
  ) {
    createTareaDto.id_leccion = leccionId;
    const tarea = await this.leccionesService.createTarea(createTareaDto);
    return {
      message: 'Tarea creada exitosamente',
      status: 201,
      data: tarea,
    };
  }

  @Get(':leccionId/tareas')
  findAllTareasByLeccion(@Param('leccionId', ParseIntPipe) leccionId: number) {
    return this.leccionesService.findAllTareasByLeccion(leccionId);
  }

  @Patch('tareas/:id')
  async updateTarea(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTareaDto: UpdateTareaDto,
  ) {
    const tarea = await this.leccionesService.updateTarea(id, updateTareaDto);
    return {
      message: `Tarea con ID ${id} actualizada correctamente`,
      status: 200,
      data: tarea,
    };
  }

  @Delete('tareas/:id')
  async removeTarea(@Param('id', ParseIntPipe) id: number) {
    await this.leccionesService.removeTarea(id);
    return { message: `Tarea con ID ${id} eliminada`, status: 200 };
  }

  // --- Endpoints para Evaluaciones (anidados en lecciones) ---

  @Post(':leccionId/evaluaciones')
  async createEvaluacion(
    @Param('leccionId', ParseIntPipe) leccionId: number,
    @Body() createEvaluacionDto: CreateEvaluacionDto,
  ) {
    createEvaluacionDto.id_leccion = leccionId;
    const evaluacion = await this.leccionesService.createEvaluacion(
      createEvaluacionDto,
    );
    return {
      message: 'Evaluación creada exitosamente',
      status: 201,
      data: evaluacion,
    };
  }

  @Get(':leccionId/evaluaciones')
  findAllEvaluacionesByLeccion(
    @Param('leccionId', ParseIntPipe) leccionId: number,
  ) {
    return this.leccionesService.findAllEvaluacionesByLeccion(leccionId);
  }

  @Patch('evaluaciones/:id')
  async updateEvaluacion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEvaluacionDto: UpdateEvaluacionDto,
  ) {
    const evaluacion = await this.leccionesService.updateEvaluacion(
      id,
      updateEvaluacionDto,
    );
    return {
      message: `Evaluación con ID ${id} actualizada correctamente`,
      status: 200,
      data: evaluacion,
    };
  }

  @Delete('evaluaciones/:id')
  async removeEvaluacion(@Param('id', ParseIntPipe) id: number) {
    await this.leccionesService.removeEvaluacion(id);
    return { message: `Evaluación con ID ${id} eliminada`, status: 200 };
  }
}