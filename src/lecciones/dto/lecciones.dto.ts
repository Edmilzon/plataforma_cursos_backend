import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

// DTOs para Leccion
export class CreateLeccionDto {
  @IsString() @IsNotEmpty() titulo: string;
  @IsString() @IsNotEmpty() contenido: string;
  @IsOptional() @IsString() url_recurso?: string;
  @IsNumber() orden: number;
  @IsNumber() id_modulo: number;
}

export class UpdateLeccionDto {
  @IsOptional() @IsString() @IsNotEmpty() titulo?: string;
  @IsOptional() @IsString() @IsNotEmpty() contenido?: string;
  @IsOptional() @IsString() url_recurso?: string;
  @IsOptional() @IsNumber() orden?: number;
}

// DTOs para Tarea (ya definidos en cursos.dto.ts, pero mejor aquí)
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

// DTOs para Evaluacion (ya definidos en cursos.dto.ts, pero mejor aquí)
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