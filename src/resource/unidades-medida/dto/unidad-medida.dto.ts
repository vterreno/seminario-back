import { IsString, IsBoolean, IsOptional, Length } from 'class-validator';

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