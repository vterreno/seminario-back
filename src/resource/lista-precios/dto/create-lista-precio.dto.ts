import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ProductoListaPrecioDto } from "./producto-lista-precio.dto";

export class CreateListaPrecioDto {
    @IsString()
    nombre: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsBoolean()
    estado?: boolean;

    @IsOptional()
    @IsNumber()
    empresa_id?: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductoListaPrecioDto)
    productos?: ProductoListaPrecioDto[];
}
