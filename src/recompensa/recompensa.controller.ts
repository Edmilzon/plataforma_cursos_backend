import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  Patch,
  Delete,
} from '@nestjs/common';
import { RecompensaService } from './recompensa.service';
import {
  CanjearRecompensaDto,
  CreateRecompensaDto,
  UpdateRecompensaDto,
} from './dto/recompensa.dto';

@Controller('recompensas')
export class RecompensaController {
  constructor(private readonly recompensaService: RecompensaService) {}

  @Post()
  create(@Body() createRecompensaDto: CreateRecompensaDto) {
    return this.recompensaService.create(createRecompensaDto);
  }

  @Get()
  async findAll() {
    // Endpoint para administradores
    return this.recompensaService.findAll();
  }

<<<<<<< HEAD
  @Get('disponibles')
  async findAllActive() {
    // Endpoint para usuarios
    return this.recompensaService.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recompensaService.findOne(id);
=======
  @Get('usuario/:id')
  async findRedeemedByUser(@Param('id', ParseIntPipe) id: number) {
    return this.recompensaService.findRedeemedByUser(id);
>>>>>>> origin/ajustes-pago
  }

  @Post(':id/canjear')
  @HttpCode(200)
  async canjear(
    @Param('id', ParseIntPipe) id: number,
    @Body() canjearRecompensaDto: CanjearRecompensaDto,
  ) {
    return this.recompensaService.canjear(id, canjearRecompensaDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecompensaDto: UpdateRecompensaDto,
  ) {
    return this.recompensaService.update(id, updateRecompensaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recompensaService.remove(id);
  }
}