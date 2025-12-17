import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { InsigniaService } from './insignia.service';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiBody, ApiQuery } from '@nestjs/swagger';
import { InsigniaUsuarioDto } from './dto/insignia.dto';
import { CreateInsigniaDto, UpdateInsigniaDto } from './dto/create-insignia.dto';

@ApiTags('Insignias')
@Controller('insignias')
export class InsigniaController {
  constructor(private readonly insigniaService: InsigniaService) {}

  // ==================== ENDPOINTS EXISTENTES ====================

  @Get('usuario/:idUsuario')
  @ApiOperation({
    summary: 'Obtener las insignias de un usuario',
    description: 'Devuelve una lista de todas las insignias obtenidas por un usuario específico.',
  })
  @ApiParam({ name: 'idUsuario', description: 'El ID del usuario', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'Lista de insignias del usuario recuperada exitosamente.',
    type: [InsigniaUsuarioDto],
  })
  findInsigniasByUsuario(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
  ): Promise<InsigniaUsuarioDto[]> {
    return this.insigniaService.findInsigniasByUsuario(idUsuario);
  }

  // ==================== CRUD ENDPOINTS ====================

  @Post()
  @ApiOperation({ summary: 'Crear una nueva insignia' })
  @ApiBody({ type: CreateInsigniaDto })
  @ApiOkResponse({ description: 'Insignia creada exitosamente' })
  create(@Body() createInsigniaDto: CreateInsigniaDto) {
    return this.insigniaService.create(createInsigniaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las insignias' })
  @ApiOkResponse({ description: 'Lista de todas las insignias' })
  findAll() {
    return this.insigniaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una insignia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la insignia', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Insignia encontrada' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.insigniaService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una insignia' })
  @ApiParam({ name: 'id', description: 'ID de la insignia', type: Number, example: 1 })
  @ApiBody({ type: UpdateInsigniaDto })
  @ApiOkResponse({ description: 'Insignia actualizada exitosamente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInsigniaDto: UpdateInsigniaDto,
  ) {
    return this.insigniaService.update(id, updateInsigniaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una insignia' })
  @ApiParam({ name: 'id', description: 'ID de la insignia', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Insignia eliminada exitosamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.insigniaService.remove(id);
  }

  // ==================== ENDPOINTS ADICIONALES ====================

  @Get('search/buscar')
  @ApiOperation({ summary: 'Buscar insignias por nombre' })
  @ApiQuery({ name: 'nombre', description: 'Nombre a buscar', required: false })
  @ApiOkResponse({ description: 'Resultados de la búsqueda' })
  search(@Query('nombre') nombre: string) {
    return this.insigniaService.searchByName(nombre);
  }

  @Get('contar/total')
  @ApiOperation({ summary: 'Contar total de insignias' })
  @ApiOkResponse({ description: 'Total de insignias' })
  count() {
    return this.insigniaService.count();
  }

  @Post('asignar/:idUsuario/:idInsignia')
  @ApiOperation({ summary: 'Asignar insignia a usuario' })
  @ApiParam({ name: 'idUsuario', description: 'ID del usuario', type: Number, example: 1 })
  @ApiParam({ name: 'idInsignia', description: 'ID de la insignia', type: Number, example: 1 })
  @ApiOkResponse({ description: 'Insignia asignada exitosamente' })
  asignarInsignia(
    @Param('idUsuario', ParseIntPipe) idUsuario: number,
    @Param('idInsignia', ParseIntPipe) idInsignia: number,
  ) {
    return this.insigniaService.asignarInsigniaUsuario(idUsuario, idInsignia);
  }

  @Get('reportes/otorgadas')
  @ApiOperation({ summary: 'Reporte de insignias otorgadas' })
  @ApiOkResponse({ description: 'Reporte general y por estudiante de insignias otorgadas.' })
  getReporteInsigniasOtorgadas() {
    return this.insigniaService.getReporteInsigniasOtorgadas();
  }
}