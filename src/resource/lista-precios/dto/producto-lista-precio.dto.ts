import { IsNumber, IsPositive, Min } from "class-validator";

export class ProductoListaPrecioDto {
    @IsNumber()
    @IsPositive({ message: 'El ID del producto debe ser un número positivo' })
    productoId: number;

    @IsNumber()
    @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
    precioEspecifico: number;
}
