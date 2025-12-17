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
  Query,
} from '@nestjs/common';
import { EntregasService } from '../entregas/entregas.service';
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
  constructor(
    private readonly leccionesService: LeccionesService,
    private readonly entregasService: EntregasService // FALTA ESTO
  ) {}

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
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.leccionesService.remove(id);
  }

  @Post(':leccionId/tareas')
  async createTarea(
    @Param('leccionId', ParseIntPipe) leccionId: number,
    @Body() createTareaDto: CreateTareaDto,
  ) {
    createTareaDto.id_leccion = leccionId;
    return this.leccionesService.createTarea(createTareaDto);
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
    return this.leccionesService.updateTarea(id, updateTareaDto);
  }

  @Get('certificado/validar')
  async validarCertificado(
    @Query('usuario') idUsuario: number,
    @Query('curso') idCurso: number,
  ) {
    return this.entregasService.obtenerCertificado(idUsuario, idCurso);
  }

  @Delete('tareas/:id')
  @HttpCode(204)
  async removeTarea(@Param('id', ParseIntPipe) id: number) {
    await this.leccionesService.removeTarea(id);
  }

  @Post(':leccionId/evaluaciones')
  async createEvaluacion(
    @Param('leccionId', ParseIntPipe) leccionId: number,
    @Body() createEvaluacionDto: CreateEvaluacionDto,
  ) {
    createEvaluacionDto.id_leccion = leccionId;
    return this.leccionesService.createEvaluacion(createEvaluacionDto);
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
    return this.leccionesService.updateEvaluacion(
      id,
      updateEvaluacionDto,
    );
  }

  @Delete('evaluaciones/:id')
  @HttpCode(204)
  async removeEvaluacion(@Param('id', ParseIntPipe) id: number) {
    await this.leccionesService.removeEvaluacion(id);
  }
}