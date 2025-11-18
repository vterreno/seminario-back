import { IsNotEmpty, IsNumber, IsIn, IsDateString } from "class-validator";

export class AsociarPagoCompraDto {
    @IsNotEmpty({ message: 'La fecha de pago es requerida' })
    @IsDateString({}, { message: 'La fecha de pago debe ser una fecha válida' })
    fecha_pago: string;

    @IsNotEmpty({ message: 'El monto de pago es requerido' })
    @IsNumber({}, { message: 'El monto de pago debe ser un número' })
    monto_pago: number;

    @IsNotEmpty({ message: 'El método de pago es requerido' })
    @IsIn(['efectivo', 'transferencia'], { message: 'El método de pago debe ser efectivo o transferencia' })
    metodo_pago: 'efectivo' | 'transferencia';

    @IsNotEmpty({ message: 'La sucursal es requerida' })
    @IsNumber({}, { message: 'La sucursal debe ser un número' })
    sucursal_id: number;
}
