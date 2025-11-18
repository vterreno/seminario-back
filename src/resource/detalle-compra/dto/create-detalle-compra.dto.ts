import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf, Min, Max } from "class-validator";

export class CreateDetalleCompraDto {
    @ValidateIf(o => !o.producto_id)
    @IsNotEmpty({ message: 'Debe proporcionar producto_proveedor_id o producto_id' })
    @IsNumber({}, { message: 'El id del producto-proveedor debe ser un número' })
    producto_proveedor_id?: number;

    @ValidateIf(o => !o.producto_proveedor_id)
    @IsNotEmpty({ message: 'Debe proporcionar producto_proveedor_id o producto_id' })
    @IsNumber({}, { message: 'El id del producto debe ser un número' })
    producto_id?: number;

    @IsNotEmpty({ message: 'La cantidad es requerida' })
    @IsNumber({}, { message: 'La cantidad debe ser un número' })
    cantidad: number;

    @IsNotEmpty({ message: 'El precio unitario es requerido' })
    @IsNumber({}, { message: 'El precio unitario debe ser un número' })
    precio_unitario: number;

    @IsOptional()
    @IsNumber({}, { message: 'El porcentaje de IVA debe ser un número' })
    @Min(0, { message: 'El porcentaje de IVA no puede ser negativo' })
    @Max(100, { message: 'El porcentaje de IVA no puede ser mayor a 100' })
    iva_porcentaje?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El monto de IVA debe ser un número' })
    @Min(0, { message: 'El monto de IVA no puede ser negativo' })
    iva_monto?: number;

    @IsNotEmpty({ message: 'El subtotal es requerido' })
    @IsNumber({}, { message: 'El subtotal debe ser un número' })
    subtotal: number;

    @IsOptional()
    @IsNumber({}, { message: 'El id de la compra debe ser un número' })
    compra_id?: number;
    
    @IsOptional()
    @IsString({ message: 'El código temporal del producto debe ser un texto' })
    codigo_producto_temp?: string;
}
