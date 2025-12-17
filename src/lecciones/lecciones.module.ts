import { Module } from '@nestjs/common';
import { LeccionesService } from './lecciones.service';
import { LeccionesController } from './lecciones.controller';
import { EntregasModule } from '../entregas/entregas.module';

@Module({
  controllers: [LeccionesController],
  providers: [LeccionesService],
  exports: [LeccionesService],
  imports: [EntregasModule],
})
export class LeccionesModule {}