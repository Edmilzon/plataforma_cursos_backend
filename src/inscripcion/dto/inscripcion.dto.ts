import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
  @Min(0)
  puntos_utilizados?: number;
}
