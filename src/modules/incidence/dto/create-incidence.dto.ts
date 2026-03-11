import { Shift } from '@prisma/client';
import {
  IsDateString,
  IsInt,
  IsOptional,
  Matches,
  MaxLength,
  MinLength,
  IsString,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';

const toNumber = ({ value }) =>
  value === undefined || value === null || value === '' ? null : Number(value);

export class CreateIncidenceDto {
  @Transform(toNumber)
  @IsInt()
  unidad_id: number;

  @Transform(toNumber)
  @IsInt()
  tipo_caso_id: number;

  @Transform(toNumber)
  @IsInt()
  sub_tipo_caso_id: number;

  @Transform(toNumber)
  @IsInt()
  tipo_reportante_id: number;

  @IsOptional()
  @IsString()
  @MinLength(9, { message: 'El celular debe tener mínimo 9 dígitos' })
  @MaxLength(15, { message: 'El celular debe tener máximo 15 dígitos' })
  telefono_reportante?: string;

  @Transform(toNumber)
  @IsInt()
  cargo_sereno_id: number;

  @IsString()
  nombre_reportante: string;

  @Transform(toNumber)
  @IsInt()
  sereno_id: number;

  @IsString()
  direccion: string;

  @IsString()
  @Matches(/^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/, {
    message: 'Latitud debe ser un número entre -90 y 90',
  })
  latitud: string;

  @IsString()
  @Matches(/^-?((1[0-7]|[1-9])?\d(\.\d+)?|180(\.0+)?)$/, {
    message: 'Longitud debe ser un número entre -180 y 180',
  })
  longitud: string;

  @Transform(toNumber)
  @IsInt()
  jurisdiccion_id: number;

  @IsOptional()
  @IsDateString()
  fecha_registro?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Hora registro debe estar en formato HH:MM:SS',
  })
  hora_registro?: string;

  @IsDateString()
  fecha_ocurrencia: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Hora registro debe estar en formato HH:MM:SS',
  })
  hora_ocurrencia: string;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  estado_proceso_id?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  estado_agresor_id?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  genero_agresor_id?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  genero_victima_id?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  severidad_proceso_id?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  severidad_id?: number;

  @Transform(toNumber)
  @IsInt()
  medio_id: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  medio_reporte_id?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  situacion_id?: number;

  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  operador_id?: number;

  @IsString({ message: 'Descripcion debe ser un texto' })
  @MinLength(10, {
    message: 'Descripcion debe ser un texto mínimo 10 caracteres',
  })
  descripcion: string;

  @IsOptional()
  @IsEnum(Shift)
  turno: Shift;
}
