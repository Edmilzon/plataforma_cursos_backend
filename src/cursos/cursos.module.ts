import { Module } from '@nestjs/common';
import { CursosService } from './cursos.service';
import { CursosController } from './cursos.controller';
import { LeccionesModule } from 'src/lecciones/lecciones.module';

@Module({
  imports: [LeccionesModule], // Importamos LeccionesModule para poder usar LeccionesService
  controllers: [CursosController],
  providers: [CursosService],
})
export class CursosModule {}