import { IsNumber, IsPositive, Min } from "class-validator";

export class ProductoListaPrecioDto {
    @IsNumber()
    @IsPositive({ message: 'El ID del producto debe ser un número positivo' })
    producto_id: number;

    @IsNumber()
    @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
    precio_venta_especifico: number;
}
