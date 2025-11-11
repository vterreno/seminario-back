import { IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength, IsArray } from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Formato de email inválido' })
  email?: string;

  @IsOptional()
  @MinLength(7, { message: 'La contraseña debe tener al menos 7 caracteres' })
  password?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El ID del rol debe ser un número' })
  role_id?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de empresa debe ser un número' })
  empresa_id?: number;

  @IsOptional()
  @IsArray({ message: 'Los IDs de sucursales deben ser un array' })
  @IsNumber({}, { each: true, message: 'Cada ID de sucursal debe ser un número' })
  sucursal_ids?: number[];

  @IsOptional()
  @IsBoolean()
  status?: boolean;
}