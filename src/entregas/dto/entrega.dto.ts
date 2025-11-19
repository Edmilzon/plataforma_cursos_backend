import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
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