import { Type } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateDetalleCompraDto } from "src/resource/detalle-compra/dto/create-detalle-compra.dto";
import { EstadoCompra } from "src/database/core/enums/EstadoCompra.enum";

export class CreateCompraDto {
    @IsNotEmpty({ message: 'La fecha de compra es requerida' })
    @IsString({ message: 'La fecha de compra debe ser un texto' })
    fecha_compra: string; // O Date si usas transformación

    @IsNotEmpty({ message: 'Los detalles de la compra son requeridos' })
    @IsArray({ message: 'Los detalles deben ser un array' })
    @ValidateNested({ each: true })
    @Type(() => CreateDetalleCompraDto)
    detalles: CreateDetalleCompraDto[];

    @IsNotEmpty({ message: 'El monto total es requerido' })
    @IsNumber({}, { message: 'El monto total debe ser un número' })
    monto_total: number;

    @IsOptional()
    @IsNumber({}, { message: 'El ID de contacto debe ser un número' })
    contacto_id?: number;

    @IsNotEmpty({ message: 'El ID de sucursal es requerido' })
    @IsNumber({}, { message: 'El ID de sucursal debe ser un número' })
    sucursal_id: number;

    @IsOptional()
    @IsString({ message: 'El número de factura debe ser un texto' })
    numero_factura?: string;

    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser un texto' })
    observaciones?: string;

    @IsOptional()
    @IsEnum(EstadoCompra, { message: 'El estado debe ser un valor válido' })
    estado?: EstadoCompra;
}
