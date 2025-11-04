import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  Matches,
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

// DTOs para Modulo
export class CreateModuloDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsString() @IsNotEmpty() descripcion: string;
  @IsNumber() orden: number;
  @IsNumber() id_curso: number;
}

export class UpdateModuloDto {
  @IsOptional() @IsString() @IsNotEmpty() nombre?: string;
  @IsOptional() @IsString() @IsNotEmpty() descripcion?: string;
  @IsOptional() @IsNumber() orden?: number;
}

// DTOs para Tarea
export class CreateTareaDto {
  @IsString() @IsNotEmpty() titulo: string;
  @IsString() @IsNotEmpty() descripcion: string;
  @IsOptional() @IsString() url_contenido?: string;
  @IsDateString() fecha_entrega: string;
  @IsNumber() id_leccion: number;
}

export class UpdateTareaDto {
  @IsOptional() @IsString() @IsNotEmpty() titulo?: string;
  @IsOptional() @IsString() @IsNotEmpty() descripcion?: string;
  @IsOptional() @IsString() url_contenido?: string;
  @IsOptional() @IsDateString() fecha_entrega?: string;
}

// DTOs para Evaluacion
export class CreateEvaluacionDto {
  @IsString() @IsNotEmpty() titulo: string;
  @IsString() @IsNotEmpty() descripcion: string;
  @IsString() @IsNotEmpty() tipo: string;
  @IsDateString() fecha_hora_inicio: string;
  @IsDateString() fecha_hora_entrega: string;
  @IsNumber() @Min(0) calificacion_maxima: number;
  @IsNumber() id_leccion: number;
}

export class UpdateEvaluacionDto {
  @IsOptional() @IsString() @IsNotEmpty() titulo?: string;
  @IsOptional() @IsString() @IsNotEmpty() descripcion?: string;
  @IsOptional() @IsString() @IsNotEmpty() tipo?: string;
  @IsOptional() @IsDateString() fecha_hora_inicio?: string;
  @IsOptional() @IsDateString() fecha_hora_entrega?: string;
  @IsOptional() @IsNumber() @Min(0) calificacion_maxima?: number;
}

// DTOs para Horario
export class CreateHorarioDto {
  @IsString() @IsNotEmpty() dia_semana: string;
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'hora_inicio must be in HH:MM:SS format' }) hora_inicio: string;
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, { message: 'hora_fin must be in HH:MM:SS format' }) hora_fin: string;
  @IsNumber() id_curso: number;
}

export class UpdateHorarioDto extends CreateHorarioDto {}