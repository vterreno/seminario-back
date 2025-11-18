import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { CreateDetalleCompraDto } from "src/resource/detalle-compra/dto/create-detalle-compra.dto";
import { EstadoCompra } from "src/database/core/enums/EstadoCompra.enum";
import { CreateNuevoProductoDto } from "./create-nuevo-producto.dto";
import { CreatePagoDto } from "src/resource/pago/dto/create-pago.dto";

export class CreateCostoAdicionalCompraDto {
    @IsNotEmpty({ message: 'El concepto es requerido' })
    @IsString({ message: 'El concepto debe ser un texto' })
    concepto: string;

    @IsNotEmpty({ message: 'El monto es requerido' })
    @IsNumber({}, { message: 'El monto debe ser un número' })
    monto: number;
}

export class CreateCompraDto {
    @IsNotEmpty({ message: 'La fecha de compra es requerida' })
    @Transform(({ value }) => {
        // Si ya es una fecha válida, devolverla
        if (value instanceof Date && !isNaN(value.getTime())) {
            return value;
        }
        // Si es una cadena, intentar convertirla
        if (typeof value === 'string') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('La fecha de compra no es válida');
            }
            return date;
        }
        throw new Error('La fecha de compra debe ser una fecha válida');
    })
    @IsDate({ message: 'La fecha de compra debe ser una fecha válida' })
    fecha_compra: Date;

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

    @IsOptional()
    @IsArray({ message: 'Los nuevos productos deben ser un array' })
    @ValidateNested({ each: true })
    @Type(() => CreateNuevoProductoDto)
    nuevos_productos?: CreateNuevoProductoDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => CreatePagoDto)
    pago?: CreatePagoDto;

    @IsOptional()
    @IsArray({ message: 'Los costos adicionales deben ser un array' })
    @ValidateNested({ each: true })
    @Type(() => CreateCostoAdicionalCompraDto)
    costos_adicionales?: CreateCostoAdicionalCompraDto[];
}
