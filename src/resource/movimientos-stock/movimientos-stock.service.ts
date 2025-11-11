import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';

@Injectable()
export class MovimientosStockService extends BaseService<MovimientoStockEntity>{
    findManyOptions: FindManyOptions<MovimientoStockEntity> = {};
    findOneOptions: FindOneOptions<MovimientoStockEntity> = {};
    constructor(
        @InjectRepository(MovimientoStockEntity) 
        protected movimientoStockRepository: Repository<MovimientoStockEntity>,
        @InjectRepository(ProductoEntity)
        protected productoRepository: Repository<ProductoEntity>,
        @InjectRepository(sucursalEntity)
        protected sucursalRepository: Repository<sucursalEntity>,
    ){
        super(movimientoStockRepository);
    }

    async create(data: Partial<MovimientoStockEntity>): Promise<MovimientoStockEntity> {
        // Usar transacción para asegurar atomicidad
        return await this.movimientoStockRepository.manager.transaction(async manager => {
            try {
                // Buscar el producto con su sucursal para validar sucursal
                const producto = await manager.findOne(ProductoEntity, {
                    where: { id: data.producto_id },
                    relations: ['sucursal']
                });
                
                if (!producto) {
                    throw new BadRequestException('Producto no encontrado.');
                }

                // Validar que el producto pertenece a la sucursal si se proporciona sucursal_id
                if (data.sucursal_id && producto.sucursal?.id !== data.sucursal_id) {
                    throw new BadRequestException('Producto no pertenece a la sucursal especificada.');
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
                    sucursal_id: data.sucursal_id
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
                throw new BadRequestException('Error interno al crear el movimiento de stock.');
            }
        });
    }

    // Get all movimientos (for superadmin)
    async getAllMovimientos(): Promise<MovimientoStockEntity[]> {
        return await this.movimientoStockRepository.find({
            relations: ['sucursal', 'producto'],
            order: { fecha: 'DESC' }
        });
    }

    // Get movimientos filtered by Empresa
    async getMovimientosByEmpresa(empresaId: number): Promise<MovimientoStockEntity[]> {
        //Encontrar todas las sucursales que pertenecen a la empresa
        const sucursalesDeLaEmpresa = await this.sucursalRepository.find({
            where: { empresa_id: empresaId } 
        });

        //Si esa empresa no tiene sucursales, devolvemos un array vacío.
        if (sucursalesDeLaEmpresa.length === 0) {
            return [];
        }

        //Extraer solo los IDs de esas sucursales
        const sucursalIds = sucursalesDeLaEmpresa.map(sucursal => sucursal.id);

        return await this.getMovimientosBySucursal(sucursalIds);
    }

    // Get movimientos filtered by sucursal
    async getMovimientosBySucursal(sucursalId: number[]): Promise<MovimientoStockEntity[]> {
        return await this.movimientoStockRepository.find({
            where: { sucursal_id: In(sucursalId) },
            relations: ['producto'],
            order: { fecha: 'DESC' }
        });
    }

    // Get movimientos by producto ID
    async getMovimientosByProducto(productoId: number, sucursalId?: number[]): Promise<MovimientoStockEntity[]> {
        const whereCondition: any = { producto_id: productoId };
        // If sucursal ID is provided, filter by it as well
        if (sucursalId) {
            whereCondition.sucursal_id = sucursalId;
        }
        return await this.movimientoStockRepository.find({
            where: whereCondition,
            relations: ['producto'],
            order: { fecha: 'DESC' }
        });
    }

    // Método específico para ajustes de stock que maneja usuarios con y sin sucursal
    async realizarAjusteStock(data: Partial<MovimientoStockEntity>): Promise<MovimientoStockEntity> {
        // Si no se proporciona sucursal_id, obtenerla del producto (caso superadmin)
        if (!data.sucursal_id) {
            const producto = await this.productoRepository.findOne({
                where: { id: data.producto_id },
                relations: ['sucursal']
            });
            
            if (!producto) {
                throw new BadRequestException('Producto no encontrado.');
            }
            
            if (!producto.sucursal?.id) {
                throw new BadRequestException('El producto no tiene una sucursal asociada.');
            }
            
            data.sucursal_id = producto.sucursal.id;
        }
        
        // Usar el método create existente que ya tiene toda la lógica de transacciones
        return this.create(data);
    }

    // Método para crear movimiento de stock SOLO como registro histórico
    // No modifica el stock del producto (útil cuando el stock ya fue modificado por otro proceso)
    async createMovimientoRegistro(data: Partial<MovimientoStockEntity>, stockResultante: number): Promise<MovimientoStockEntity> {
        return await this.movimientoStockRepository.manager.transaction(async manager => {
            try {
                // Buscar el producto con su sucursal para validar
                const producto = await manager.findOne(ProductoEntity, {
                    where: { id: data.producto_id },
                    relations: ['sucursal']
                });
                
                if (!producto) {
                    throw new BadRequestException('Producto no encontrado.');
                }

                // Si no se proporciona sucursal_id, obtenerla del producto
                if (!data.sucursal_id) {
                    if (!producto.sucursal?.id) {
                        throw new BadRequestException('El producto no tiene una sucursal asociada.');
                    }
                    data.sucursal_id = producto.sucursal.id;
                }

                // Validar que el producto pertenece a la sucursal si se proporciona sucursal_id
                if (data.sucursal_id && producto.sucursal?.id !== data.sucursal_id) {
                    throw new BadRequestException('Producto no pertenece a la sucursal especificada.');
                }

                // Crear el movimiento sin modificar el stock del producto
                const movimiento = manager.create(MovimientoStockEntity, {
                    fecha: new Date(),
                    tipo_movimiento: data.tipo_movimiento,
                    descripcion: data.descripcion,
                    cantidad: data.cantidad, // Guardar la cantidad tal cual viene
                    stock_resultante: stockResultante, // Stock resultante después del cambio
                    producto_id: data.producto_id,
                    sucursal_id: data.sucursal_id
                });

                // Guardar solo el movimiento, SIN tocar el stock del producto
                const movimientoGuardado = await manager.save(MovimientoStockEntity, movimiento);

                return movimientoGuardado;

            } catch (error) {
                if (error instanceof BadRequestException) {
                    throw error;
                }
                console.error('Error al crear movimiento de stock (registro):', error);
                throw new BadRequestException('Error interno al crear el registro de movimiento de stock.');
            }
        });
    }
}
