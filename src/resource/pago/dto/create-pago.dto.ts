// create-pago.dto.ts
import { IsNotEmpty, IsNumber, IsString, MaxLength } from "class-validator";

export class CreatePagoDto {
    @IsNotEmpty({ message: 'La fecha de pago es requerida' })
    @IsString({ message: 'La fecha de pago debe ser un texto' })
    fecha_pago: string; // O Date si usas transformación

    @IsNotEmpty({ message: 'El monto de pago es requerido' })
    @IsNumber({}, { message: 'El monto de pago debe ser un número' })
    monto_pago: number;

    @IsNotEmpty({ message: 'El método de pago es requerido' })
    @IsString({ message: 'El método de pago debe ser un texto' })
    @MaxLength(255, { message: 'El método de pago no puede exceder 255 caracteres' })
    metodo_pago: string;

    @IsNotEmpty({ message: 'La sucursal es requerida' })
    @IsNumber({}, { message: 'La sucursal debe ser un número' })
    sucursal_id: number;

    // Removido venta_id porque se asigna automáticamente
}