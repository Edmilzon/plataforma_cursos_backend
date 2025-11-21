import { IsNotEmpty, IsNumber } from 'class-validator';

export class CanjearRecompensaDto {
  @IsNumber()
  @IsNotEmpty()
  id_usuario: number;
}