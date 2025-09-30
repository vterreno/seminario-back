import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class MovimientosStockService extends BaseService<MovimientoStockEntity>{
    findManyOptions: FindManyOptions<MovimientoStockEntity> = {};
    findOneOptions: FindOneOptions<MovimientoStockEntity> = {};
    constructor(
        @InjectRepository(MovimientoStockEntity) 
        protected movimientoStockRepository: Repository<MovimientoStockEntity>,
        @InjectRepository(ProductoEntity)
        protected productoRepository: Repository<ProductoEntity>
    ){
        super(movimientoStockRepository);
    }

    async create(data: Partial<MovimientoStockEntity>): Promise<MovimientoStockEntity> {
        // Usar transacción para asegurar atomicidad
        return await this.movimientoStockRepository.manager.transaction(async manager => {
            try {
                // Buscar el producto
                const producto = await manager.findOne(ProductoEntity, {
                    where: { id: data.producto_id, empresa_id: data.empresa_id }
                });
                
                if (!producto) {
                    throw new BadRequestException('Producto no encontrado o no pertenece a la empresa.');
                }

                // Calcular el cambio en el stock según el tipo de movimiento
                let cambioStock = 0;
                const cantidad = data.cantidad ?? 0;

                switch (data.tipo_movimiento) {
                    case TipoMovimientoStock.COMPRA:
                    case TipoMovimientoStock.STOCK_APERTURA:
                        cambioStock = Math.abs(cantidad); // Siempre positivo (aumenta stock)
                        break;
                    
                    case TipoMovimientoStock.VENTA:
                        cambioStock = -Math.abs(cantidad); // Siempre negativo (reduce stock)
                        break;
                    
                    case TipoMovimientoStock.AJUSTE_MANUAL:
                        // Para ajustes manuales, la cantidad ya viene con el signo correcto desde el controlador
                        cambioStock = cantidad;
                        break;
                    
                    default:
                        throw new BadRequestException('Tipo de movimiento no válido.');
                }

                // Calcular el nuevo stock
                const nuevoStock = producto.stock + cambioStock;

                // Validar que el stock no sea negativo
                if (nuevoStock < 0) {
                    const tipoOperacion = cambioStock > 0 ? 'aumento' : 'disminución';
                    throw new BadRequestException(
                        `No se puede realizar el ${tipoOperacion}. Stock actual: ${producto.stock}, cantidad a ${tipoOperacion === 'aumento' ? 'agregar' : 'quitar'}: ${Math.abs(cambioStock)}. El stock resultante sería: ${nuevoStock}`
                    );
                }

                // Crear el movimiento
                const movimiento = manager.create(MovimientoStockEntity, {
                    fecha: new Date(),
                    tipo_movimiento: data.tipo_movimiento,
                    descripcion: data.descripcion,
                    cantidad: cambioStock, // Guardar el cambio real aplicado
                    stock_resultante: nuevoStock,
                    producto_id: data.producto_id,
                    empresa_id: data.empresa_id
                });

                // Guardar el movimiento
                const movimientoGuardado = await manager.save(MovimientoStockEntity, movimiento);

                // Actualizar el stock del producto
                producto.stock = nuevoStock;
                await manager.save(ProductoEntity, producto);

                return movimientoGuardado;

            } catch (error) {
                // Re-lanzar errores de validación de negocio
                if (error instanceof BadRequestException) {
                    throw error;
                }
                // Para otros errores, mostrar mensaje genérico pero loggear el error real
                console.error('Error al crear movimiento de stock:', error);
                throw new BadRequestException('Error interno al crear el movimiento de stock.');
            }
        });
    }
    // Get movimientos filtered by company
    async getMovimientosByEmpresa(empresaId: number): Promise<MovimientoStockEntity[]> {
        return await this.movimientoStockRepository.find({
            where: { empresa_id: empresaId },
            relations: ['producto'],
            order: { fecha: 'DESC' }
        });
    }

    // Get all movimientos (for superadmin)
    async getAllMovimientos(): Promise<MovimientoStockEntity[]> {
        return await this.movimientoStockRepository.find({
            relations: ['empresa', 'producto'],
            order: { fecha: 'DESC' }
        });
    }

    // Get movimientos by producto ID
    async getMovimientosByProducto(productoId: number, empresaId?: number): Promise<MovimientoStockEntity[]> {
        const whereCondition: any = { producto_id: productoId };
        // If empresa ID is provided, filter by it as well
        if (empresaId) {
            whereCondition.empresa_id = empresaId;
        }
        return await this.movimientoStockRepository.find({
            where: whereCondition,
            relations: ['producto'],
            order: { fecha: 'DESC' }
        });
    }

    // Método específico para ajustes de stock que maneja usuarios con y sin empresa
    async realizarAjusteStock(data: Partial<MovimientoStockEntity>): Promise<MovimientoStockEntity> {
        // Si no se proporciona empresa_id, obtenerla del producto (caso superadmin)
        if (!data.empresa_id) {
            const producto = await this.productoRepository.findOne({
                where: { id: data.producto_id },
                select: ['id', 'empresa_id']
            });
            
            if (!producto) {
                throw new BadRequestException('Producto no encontrado.');
            }
            
            data.empresa_id = producto.empresa_id;
        }
        
        // Usar el método create existente que ya tiene toda la lógica de transacciones
        return this.create(data);
    }
}
