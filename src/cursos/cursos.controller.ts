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
import { LeccionesService } from 'src/lecciones/lecciones.service';
import { CreateLeccionDto } from 'src/lecciones/dto/lecciones.dto';

@Controller('cursos')
export class CursosController {
  constructor(
    private readonly cursosService: CursosService,
    private readonly leccionesService: LeccionesService,
  ) {}

  @Get()
  async findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findOne(id);
  }

  @Get('docente/:docenteId')
  async findAllByDocente(@Param('docenteId', ParseIntPipe) docenteId: number) {
    return this.cursosService.findAllByDocente(docenteId);
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
  @HttpCode(204) 
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.cursosService.remove(id);
  }


  @Post(':cursoId/modulos')
  async createModulo(
    @Param('cursoId', ParseIntPipe) cursoId: number,
    @Body() createModuloDto: CreateModuloDto,
  ) {
    createModuloDto.id_curso = cursoId;
    return this.cursosService.createModulo(createModuloDto);
  }

  @Get(':cursoId/modulos')
  async findAllModulosByCurso(@Param('cursoId', ParseIntPipe) cursoId: number) {
    return this.cursosService.findAllModulosByCurso(cursoId);
  }

  @Get(':cursoId/modulos/:moduloId/lecciones')
  async findAllLeccionesByModulo(
    @Param('moduloId', ParseIntPipe) moduloId: number,
  ) {
    return this.leccionesService.findAllByModulo(moduloId);
  }

  @Post(':cursoId/modulos/:moduloId/lecciones')
  async createLeccion(
    @Param('moduloId', ParseIntPipe) moduloId: number,
    @Body() createLeccionDto: CreateLeccionDto,
  ) {
    createLeccionDto.id_modulo = moduloId;
    return this.leccionesService.create(createLeccionDto);
  }

  @Patch(':cursoId/modulos/:id')
  async updateModulo(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModuloDto: UpdateModuloDto,
  ) {
    return this.cursosService.updateModulo(id, updateModuloDto);
  }

  @Delete(':cursoId/modulos/:id')
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

  @Patch(':cursoId/horarios/:id')
  async updateHorario(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHorarioDto: UpdateHorarioDto,
  ) {
    return this.cursosService.updateHorario(id, updateHorarioDto);
  }

  @Delete(':cursoId/horarios/:id')
  @HttpCode(204)
  async removeHorario(@Param('id', ParseIntPipe) id: number) {
    await this.cursosService.removeHorario(id);
  }

  @Get(':idCurso/tareas')
  async getTasksByCourse(@Param('idCurso') idCurso: string) {
  return this.cursosService.getTasksByCourse(Number(idCurso));
  }
}