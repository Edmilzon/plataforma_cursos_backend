import { Module } from '@nestjs/common';
import { RecompensaService } from './recompensa.service';
import { RecompensaController } from './recompensa.controller';

@Module({
  controllers: [RecompensaController],
  providers: [RecompensaService],
})
export class RecompensaModule {}