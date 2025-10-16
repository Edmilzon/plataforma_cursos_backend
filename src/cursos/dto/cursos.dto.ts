import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateCursoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;

  @IsNumber()
  @Min(1)
  duracion: number;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsString()
  @IsNotEmpty()
  modalidad: string;

  @IsNumber()
  @IsNotEmpty()
  id_docente: number;

  @IsNumber()
  @IsNotEmpty()
  id_tipo_curso: number;
}

export class UpdateCursoDto {
  // Para la actualización, hacemos todos los campos opcionales
  @IsOptional() @IsString() @IsNotEmpty() titulo?: string;
  @IsOptional() @IsString() @IsNotEmpty() descripcion?: string;
  @IsOptional() @IsDateString() fecha_inicio?: string;
  @IsOptional() @IsDateString() fecha_fin?: string;
  @IsOptional() @IsNumber() @Min(1) duracion?: number;
  @IsOptional() @IsNumber() @Min(0) precio?: number;
  @IsOptional() @IsString() @IsNotEmpty() modalidad?: string;
  @IsOptional() @IsNumber() id_docente?: number;
  @IsOptional() @IsNumber() id_tipo_curso?: number;
}