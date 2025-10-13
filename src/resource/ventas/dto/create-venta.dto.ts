// create-venta.dto.ts
import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateDetalleVentaDto } from "src/resource/detalle-venta/dto/create-detalle-venta.dto";
import { CreatePagoDto } from "src/resource/pago/dto/create-pago.dto";

export class CreateVentaDto {
    @IsNotEmpty({ message: 'La fecha de venta es requerida' })
    @IsString({ message: 'La fecha de venta debe ser un texto' })
    fecha_venta: string; // O Date si usas transformación

    @IsNotEmpty({ message: 'Los detalles de la venta son requeridos' })
    @IsArray({ message: 'Los detalles deben ser un array' })
    @ValidateNested({ each: true })
    @Type(() => CreateDetalleVentaDto)
    detalles: CreateDetalleVentaDto[];

    @IsNotEmpty({ message: 'El monto total es requerido' })
    @IsNumber({}, { message: 'El monto total debe ser un número' })
    monto_total: number;

    @IsOptional()
    @IsNumber({}, { message: 'El ID de contacto debe ser un número' })
    contacto_id?: number;

    @IsNotEmpty({ message: 'El ID de sucursal es requerido' })
    @IsNumber({}, { message: 'El ID de sucursal debe ser un número' })
    sucursal_id: number;

    @IsNotEmpty({ message: 'Los datos de pago son requeridos' })
    @ValidateNested()
    @Type(() => CreatePagoDto)
    pago: CreatePagoDto;
}