import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProductoProveedorDto {
    @IsNotEmpty({ message: 'El id del producto es requerido' })
    @IsNumber({}, { message: 'El id del producto debe ser un número' })
    producto_id: number;

    @IsNotEmpty({ message: 'El id del proveedor es requerido' })
    @IsNumber({}, { message: 'El id del proveedor debe ser un número' })
    proveedor_id: number;

    @IsNotEmpty({ message: 'El precio del proveedor es requerido' })
    @IsNumber({}, { message: 'El precio del proveedor debe ser un número' })
    precio_proveedor: number;

    @IsOptional()
    @IsString({ message: 'El código del proveedor debe ser un texto' })
    codigo_proveedor?: string;
}
