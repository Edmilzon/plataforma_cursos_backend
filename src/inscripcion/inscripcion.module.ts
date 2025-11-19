import { Module } from '@nestjs/common';
import { InscripcionService } from './inscripcion.service';
import { InscripcionController } from './inscripcion.controller';

@Module({
  controllers: [InscripcionController],
  providers: [InscripcionService],
})
export class InscripcionModule {}