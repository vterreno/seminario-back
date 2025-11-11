import { 
    PipeTransform, 
    Injectable, 
    ArgumentMetadata, 
    BadRequestException,
    Inject,
    Scope
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { MovimientosStockService } from '../movimientos-stock.service';
import { ProductosService } from 'src/resource/productos/productos.service';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';
import { CreateMovimientoStockDto } from '../dto/create-movimiento-stock.dto';

@Injectable({ scope: Scope.REQUEST })
export class MovimientosStockValidationPipe implements PipeTransform {
    constructor(
        @Inject(REQUEST) private readonly request: Request,
        private readonly productosService: ProductosService
    ) {}

    async transform(value: CreateMovimientoStockDto, metadata: ArgumentMetadata): Promise<CreateMovimientoStockDto> {
        // Si no tiene producto_id, no validar
        if (!value || !value.producto_id || !value.sucursal_id) {
            return value;
        }

        // Solo validar stock para movimientos que reducen el stock (VENTA y AJUSTE_MANUAL negativo)
        const esMovimientoSalida = value.tipo_movimiento === TipoMovimientoStock.VENTA || 
            (value.tipo_movimiento === TipoMovimientoStock.AJUSTE_MANUAL && value.cantidad < 0);

        if (esMovimientoSalida) {
            try {
                const stockActual = await this.productosService.getStockProducto(
                    value.producto_id,
                    value.sucursal_id
                );

                const cantidadMovimiento = Math.abs(value.cantidad);

                // Verificar si hay stock suficiente
                if (stockActual < cantidadMovimiento) {
                    throw new BadRequestException(
                        `Stock insuficiente. Stock actual: ${stockActual}, cantidad requerida: ${cantidadMovimiento}`
                    );
                }
            } catch (error) {
                // Si el error viene del servicio de productos (producto no encontrado), re-lanzarlo
                if (error instanceof BadRequestException) {
                    throw error;
                }
                // Si es otro tipo de error, lanzar un error genérico
                throw new BadRequestException('Error al validar el stock del producto');
            }
        }

        // Retornar el valor original
        return value;
    }
}
