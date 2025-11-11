import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
    nombre?: string;
    codigo?: string;
    sucursal_id?: number;
    marca_id?: number;
    categoria_id?: number;
    unidad_medida_id?: number;
    precio_costo?: number;
    precio_venta?: number;
    stock_apertura?: number;
    stock?: number;
    estado?: boolean;
}
