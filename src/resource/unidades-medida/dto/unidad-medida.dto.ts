import { IsString, IsBoolean, IsOptional, Length, IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class CreateUnidadMedidaDto {
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @Length(1, 50, { message: 'El nombre debe tener entre 1 y 50 caracteres' })
  nombre: string;

  @IsString({ message: 'La abreviatura debe ser un texto válido' })
  @Length(1, 10, { message: 'La abreviatura debe tener entre 1 y 10 caracteres' })
  abreviatura: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo "acepta decimales" debe ser verdadero o falso' })
  aceptaDecimales?: boolean = false;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de empresa debe ser un número válido' })
  empresaId?: number;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  estado?: boolean = true;
}

export class UpdateUnidadMedidaDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @Length(1, 50, { message: 'El nombre debe tener entre 1 y 50 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'La abreviatura debe ser un texto válido' })
  @Length(1, 10, { message: 'La abreviatura debe tener entre 1 y 10 caracteres' })
  abreviatura?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo "acepta decimales" debe ser verdadero o falso' })
  aceptaDecimales?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'El ID de empresa debe ser un número válido' })
  empresaId?: number;

  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser verdadero o falso' })
  estado?: boolean = true;
}

export class BulkDeleteUnidadMedidaDto {
  @IsArray({ message: 'Debe proporcionar una lista de IDs para eliminar' })
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos una unidad de medida para eliminar' })
  @IsNumber({}, { each: true, message: 'Todos los IDs deben ser números válidos' })
  ids: number[];
}