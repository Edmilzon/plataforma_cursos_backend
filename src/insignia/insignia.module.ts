import { Module } from '@nestjs/common';
import { InsigniaController } from './insignia.controller';
import { InsigniaService } from './insignia.service';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa TypeOrmModule para poder inyectar DataSource
import { InscripcionController } from 'src/inscripcion/inscripcion.controller';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [InsigniaController],
  providers: [InsigniaService],
})
export class InsigniaModule {}