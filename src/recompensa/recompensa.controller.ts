import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { RecompensaService } from './recompensa.service';
import { CanjearRecompensaDto } from './dto/recompensa.dto';

@Controller('recompensas')
export class RecompensaController {
  constructor(private readonly recompensaService: RecompensaService) {}

  @Get()
  async findAll() {
    return this.recompensaService.findAll();
  }

  @Post(':id/canjear')
  @HttpCode(200)
  async canjear(
    @Param('id', ParseIntPipe) id: number,
    @Body() canjearRecompensaDto: CanjearRecompensaDto,
  ) {
    return this.recompensaService.canjear(id, canjearRecompensaDto);
  }
}