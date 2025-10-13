// create-detalle-venta.dto.ts
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateDetalleVentaDto {
    @IsNotEmpty({ message: 'El id del producto es requerido' })
    @IsNumber({}, { message: 'El id del producto debe ser un número' })
    producto_id: number;

    @IsNotEmpty({ message: 'La cantidad es requerida' })
    @IsNumber({}, { message: 'La cantidad debe ser un número' })
    cantidad: number;

    @IsNotEmpty({ message: 'El precio unitario es requerido' })
    @IsNumber({}, { message: 'El precio unitario debe ser un número' })
    precio_unitario: number;

    @IsNotEmpty({ message: 'El subtotal es requerido' })
    @IsNumber({}, { message: 'El subtotal debe ser un número' })
    subtotal: number;

    @IsNotEmpty({ message: 'El id de la venta es requerido' })
    @IsNumber({}, { message: 'El id de la venta debe ser un número' })
    venta_id: number;
}