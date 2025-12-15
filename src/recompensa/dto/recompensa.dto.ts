import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CanjearRecompensaDto {
  @IsNumber()
  @IsNotEmpty()
  id_usuario: number;
}

export class CreateRecompensaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsNumber()
  @Min(0)
  puntos_requeridos: number;

  @IsNumber()
  @Min(0)
  cantidad_disponible: number;

  @IsString()
  @IsOptional()
  estado?: string = 'Activo';

  @IsString()
  @IsOptional()
  imagen_url?: string;
}

export class UpdateRecompensaDto extends PartialType(CreateRecompensaDto) {}