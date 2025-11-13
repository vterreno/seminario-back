import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

/**
 * DTO para crear un nuevo producto desde la vista de nueva compra
 * Este producto se creará en el stock cuando se registre la compra
 */
export class CreateNuevoProductoDto {
    @IsNotEmpty({ message: 'El código del producto es requerido' })
    @IsString({ message: 'El código debe ser un texto' })
    codigo: string;

    @IsNotEmpty({ message: 'El nombre del producto es requerido' })
    @IsString({ message: 'El nombre debe ser un texto' })
    nombre: string;

    @IsOptional()
    @IsNumber({}, { message: 'El ID de marca debe ser un número' })
    marca_id?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El ID de categoría debe ser un número' })
    categoria_id?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El ID de unidad de medida debe ser un número' })
    unidad_medida_id?: number;

    @IsNotEmpty({ message: 'El precio del proveedor es requerido' })
    @IsNumber({}, { message: 'El precio del proveedor debe ser un número' })
    precio_proveedor: number;

    @IsOptional()
    @IsString({ message: 'El código del proveedor debe ser un texto' })
    codigo_proveedor?: string;

    @IsNotEmpty({ message: 'El ID del proveedor es requerido' })
    @IsNumber({}, { message: 'El ID del proveedor debe ser un número' })
    proveedor_id: number;
}
