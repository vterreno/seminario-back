import { IsString, IsBoolean, IsOptional, Length, IsArray, IsNumber, ArrayMinSize } from 'class-validator';

export class CreateUnidadMedidaDto {
  @IsString()
  @Length(1, 50)
  nombre: string;

  @IsString()
  @Length(1, 10)
  abreviatura: string;

  @IsOptional()
  @IsBoolean()
  aceptaDecimales?: boolean = false;
}

export class UpdateUnidadMedidaDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  abreviatura?: string;

  @IsOptional()
  @IsBoolean()
  aceptaDecimales?: boolean;
}

export class BulkDeleteUnidadMedidaDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos una unidad de medida para eliminar' })
  @IsNumber({}, { each: true, message: 'Todos los IDs deben ser números válidos' })
  ids: number[];
}