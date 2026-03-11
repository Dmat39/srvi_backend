import { Shift, Status } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from '../../../common/dto';

export class FilterIncidenceDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsEnum(Status)
  estado?: Status;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  jurisdiccion?: number;

  @IsOptional()
  @IsEnum(Shift)
  turno?: Shift;

  @IsOptional()
  @IsDateString()
  fecha?: string;
}
