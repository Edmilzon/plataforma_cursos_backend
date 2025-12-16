import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInscripcionDto {
  @IsNumber()
  @IsNotEmpty()
  id_curso: number;

  @IsNumber()
  @IsNotEmpty()
  id_estudiante: number;

  @IsOptional()
  @IsString()
  metodo_pago?: string;

  @IsOptional()
  @IsNumber()
  id_canje_recompensa?: number; // Solo para aplicar descuento de recompensa
}