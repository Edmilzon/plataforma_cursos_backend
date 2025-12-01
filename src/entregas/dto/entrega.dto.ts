import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateEntregaDto {
  @IsNumber()
  @IsNotEmpty()
  id_usuario: number;

  @IsOptional()
  @IsNumber()
  id_tarea?: number;

  @IsOptional()
  @IsNumber()
  id_evaluacion?: number;

  @IsOptional()
  @IsUrl()
  url_archivo?: string;
}

export class CalificarEntregaDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  calificacion: number;
}