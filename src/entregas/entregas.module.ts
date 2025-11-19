import { Module } from '@nestjs/common';
import { EntregasService } from './entregas.service';
import { EntregasController } from './entregas.controller';

@Module({
  controllers: [EntregasController],
  providers: [EntregasService],
})
export class EntregasModule {}