import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RankingModule } from './ranking/ranking.module';
import { CursosModule } from './cursos/cursos.module';
import { LeccionesModule } from './lecciones/lecciones.module';
import { EntregasModule } from './entregas/entregas.module';
import { InscripcionModule } from './inscripcion/inscripcion.module';
import { RecompensaModule } from './recompensa/recompensa.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    CursosModule,
    RankingModule,
    UserModule,
    EntregasModule,
    LeccionesModule,
    InscripcionModule,
    RecompensaModule,
    AdminModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql', 
      host: process.env.DB_HOST, 
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME, 
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false 
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
