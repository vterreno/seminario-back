import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateDetalleCompraDto {
    @IsOptional()
    @IsNumber({}, { message: 'El id del producto-proveedor debe ser un número' })
    producto_proveedor_id?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El id del producto debe ser un número' })
    producto_id?: number;

    @IsNotEmpty({ message: 'La cantidad es requerida' })
    @IsNumber({}, { message: 'La cantidad debe ser un número' })
    cantidad: number;

    @IsNotEmpty({ message: 'El precio unitario es requerido' })
    @IsNumber({}, { message: 'El precio unitario debe ser un número' })
    precio_unitario: number;

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
