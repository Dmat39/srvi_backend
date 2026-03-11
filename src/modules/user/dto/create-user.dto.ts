import { Rol, Shift } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  lastname?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(Rol)
  rol: Rol;

  @IsEnum(Shift)
  @IsOptional()
  shift?: Shift;

  @IsNumber()
  @IsOptional()
  incidenceId?: number;

  @IsNumber()
  @IsOptional()
  shieldId?: number;

  @IsString()
  @IsOptional()
  observation?: string;
}
