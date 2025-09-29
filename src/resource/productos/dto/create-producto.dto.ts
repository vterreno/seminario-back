import { IsNumber, Min, Validate, IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateProductoDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
    nombre: string;

    @IsString()
    @IsNotEmpty({ message: 'El código/SKU del producto es obligatorio' })
    codigo: string;

    @IsNumber()
    @IsNotEmpty({ message: 'La empresa es obligatoria' })
    empresa_id: number;

    @IsNumber()
    @IsOptional()
    marca_id: number;
    //categoria_id: number;
    //unidad_medida_id: number;

    @IsNumber()
    @Min(0.01, { message: 'El precio de costo debe ser mayor que 0' })
    precio_costo: number;

    @IsNumber()
    @Min(0.01, { message: 'El precio de venta debe ser mayor que 0' })
    precio_venta: number;

    @IsBoolean()
    @IsOptional()
    estado: boolean;

    @IsNumber()
    @Min(0, { message: 'El stock de apertura no puede ser negativo' })
    stock_apertura: number;
}
