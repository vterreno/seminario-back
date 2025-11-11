import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';

export class CreateMovimientoStockDto {
    @IsEnum(TipoMovimientoStock)
    @IsNotEmpty()
    tipo_movimiento: TipoMovimientoStock;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsNumber()
    @IsNotEmpty()
    cantidad: number;

    @IsNumber()
    @IsNotEmpty()
    producto_id: number;

    @IsNumber()
    @IsNotEmpty()
    sucursal_id: number;
}
