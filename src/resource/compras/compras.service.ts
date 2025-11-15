import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { BaseService } from 'src/base-service/base-service.service';
import { CompraEntity } from 'src/database/core/compra.entity';
import { FindManyOptions, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { DetalleCompraService } from '../detalle-compra/detalle-compra.service';
import { MovimientosStockService } from '../movimientos-stock/movimientos-stock.service';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { ProductoProveedorService } from '../producto-proveedor/producto-proveedor.service';
import { ProductosService } from '../productos/productos.service';

@Injectable()
export class ComprasService extends BaseService<CompraEntity>{
    findManyOptions: FindManyOptions<CompraEntity> = {};
    findOneOptions: FindManyOptions<CompraEntity> = {};

    constructor(
        @InjectRepository(CompraEntity) 
        protected compraRepository: Repository<CompraEntity>,
        @InjectRepository(sucursalEntity)
        protected sucursalRepository: Repository<sucursalEntity>,
        @InjectRepository(ProductoProveedorEntity)
        protected productoProveedorRepository: Repository<ProductoProveedorEntity>,
        @InjectRepository(ProductoEntity)
        protected productoRepository: Repository<ProductoEntity>,
        private readonly detalleCompraService: DetalleCompraService,
        private readonly movimientosStockService: MovimientosStockService,
        private readonly productoProveedorService: ProductoProveedorService,
        private readonly productosService: ProductosService,
    ){
        super(compraRepository);
    }

    // Get all compras (for superadmin)
    async getAllCompras(): Promise<CompraEntity[]> {
        return await this.compraRepository.find({
            relations: ['sucursal', 'sucursal.empresa', 'contacto'],
        });
    }

    // Get compras filtered by empresa
    async getComprasByEmpresa(empresaId: number): Promise<CompraEntity[]> {
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

        return await this.getComprasBySucursal(sucursalIds);
    }

    // Get compras filtered by sucursal
    async getComprasBySucursal(sucursalId: number[]): Promise<CompraEntity[]> {
        return await this.compraRepository.find({
            where: { sucursal: { id: In(sucursalId) } },
            relations: ['sucursal', 'contacto'],
        });
    }


    // Create compra
    async createCompra(compraData: CreateCompraDto): Promise<CompraEntity> {
        try {
            // Paso 1: Verificar que la sucursal existe y obtener su información
            const sucursal = await this.sucursalRepository.findOne({
                where: { id: compraData.sucursal_id }
            });

            if (!sucursal) {
                throw new NotFoundException(`Sucursal con id ${compraData.sucursal_id} no encontrada`);
            }

            // Paso 2: Obtener el siguiente número de compra (incrementar el talonario)
            const nuevoNumeroCompra = sucursal.numero_compra + 1;
            // Paso 3: Actualizar el número de compra en la sucursal (incrementar el talonario)
            await this.sucursalRepository.update(sucursal.id, {
                numero_compra: nuevoNumeroCompra
            });

            // Paso 5: Crear la compra sin detalles pero con el número de compra generado
            const compra = this.compraRepository.create({
                numero_compra: nuevoNumeroCompra, // ← Usar el número generado del talonario
                fecha_compra: new Date(compraData.fecha_compra),
                monto_total: compraData.monto_total,
                sucursal: { id: compraData.sucursal_id } as any,
                contacto: compraData.contacto_id ? { id: compraData.contacto_id } as any : undefined,
                estado: compraData.estado || 'PENDIENTE_PAGO',
            } as any);

            // Guardar campos opcionales si existen
            if (compraData.numero_factura) {
                (compra as any).numero_factura = compraData.numero_factura;
            }
            if (compraData.observaciones) {
                (compra as any).observaciones = compraData.observaciones;
            }

            // Paso 6: Guardar la compra
            const savedCompra = await this.compraRepository.save(compra);
            const compraId = (savedCompra as any).id;

            // Paso 6.5: Crear nuevos productos si se proporcionaron
            if (compraData.nuevos_productos && compraData.nuevos_productos.length > 0) {
                await this.productoRepository.manager.transaction(async transactionalEntityManager => {
                    for (const nuevoProducto of compraData.nuevos_productos) {
                        // Verificar si el producto ya existe en esta sucursal con a pessimistic write lock
                        const productoExistente = await transactionalEntityManager.findOne(ProductoEntity, {
                            where: { 
                                codigo: nuevoProducto.codigo,
                                sucursal_id: compraData.sucursal_id 
                            },
                            lock: { mode: "pessimistic_write" }
                        });

                        if (!productoExistente) {
                            // Buscar en los detalles la cantidad comprada de este nuevo producto
                            const detalleAsociado = compraData.detalles.find(
                                d => d.codigo_producto_temp === nuevoProducto.codigo
                            );
                            const cantidadComprada = detalleAsociado ? detalleAsociado.cantidad : 0;

                            // Crear el producto con stock_apertura = cantidad_comprada
                            const productoCreado = await this.productosService.create({
                                codigo: nuevoProducto.codigo,
                                nombre: nuevoProducto.nombre,
                                marca_id: nuevoProducto.marca_id,
                                categoria_id: nuevoProducto.categoria_id,
                                unidad_medida_id: nuevoProducto.unidad_medida_id,
                                precio_costo: nuevoProducto.precio_proveedor,
                                precio_venta: nuevoProducto.precio_proveedor * 1.3, // Margen del 30% por defecto
                                stock_apertura: cantidadComprada,
                                stock: cantidadComprada, // El stock inicial es igual a la cantidad comprada
                                sucursal_id: compraData.sucursal_id,
                                estado: true,
                            } as any);

                            // Crear la relación producto-proveedor
                            await this.productoProveedorService.create({
                                producto_id: (productoCreado as any).id,
                                proveedor_id: nuevoProducto.proveedor_id,
                                precio_proveedor: nuevoProducto.precio_proveedor,
                                codigo_proveedor: nuevoProducto.codigo_proveedor,
                            });
                        }
                    }
                });
            }

            // Paso 7: Crear los detalles usando el servicio de detalle-compra
            // Esto manejará la actualización del stock automáticamente
            // Y crear movimientos de stock tipo COMPRA por cada detalle (solo registro)
            for (const detalle of compraData.detalles) {
                let productoId: number;

                // Si el detalle tiene un código temporal, buscar el producto recién creado
                if (detalle.codigo_producto_temp) {
                    const productoCreado = await this.productoRepository.findOne({
                        where: { 
                            codigo: detalle.codigo_producto_temp,
                            sucursal_id: compraData.sucursal_id 
                        }
                    });

                    if (!productoCreado) {
                        throw new NotFoundException(`Producto con código ${detalle.codigo_producto_temp} no encontrado después de crearlo`);
                    }

                    productoId = productoCreado.id;
                    // Actualizar el detalle con el producto_id del producto creado
                    detalle.producto_id = productoId;
                } else if (detalle.producto_proveedor_id) {
                    // Obtener el producto_id desde la relación producto-proveedor
                    const productoProveedor = await this.productoProveedorRepository.findOne({
                        where: { id: detalle.producto_proveedor_id },
                        relations: ['producto']
                    });

                    if (!productoProveedor) {
                        throw new NotFoundException(`Relación producto-proveedor con id ${detalle.producto_proveedor_id} no encontrada`);
                    }

                    productoId = productoProveedor.producto_id;
                } else if (detalle.producto_id) {
                    // Usar directamente el producto_id proporcionado
                    productoId = detalle.producto_id;
                } else {
                    throw new BadRequestException('Debe proporcionar producto_proveedor_id, producto_id o codigo_producto_temp en los detalles');
                }

                // Crear el detalle (esto suma el stock del producto)
                await this.detalleCompraService.createDetalle({
                    ...detalle,
                    compra_id: compraId, // Asignar la compra recién creada
                    producto_id: productoId, // Asegurar que el producto_id esté presente
                });

                const productoActualizado = await this.productoRepository.findOne({
                    where: { id: productoId }
                });

                if (!productoActualizado) {
                    throw new NotFoundException(`Producto con id ${productoId} no encontrado`);
                }

                // Crear movimiento de stock tipo COMPRA (solo registro, no modifica stock)
                await this.movimientosStockService.createMovimientoRegistro({
                    tipo_movimiento: TipoMovimientoStock.COMPRA,
                    descripcion: `Compra #${nuevoNumeroCompra} - Producto adquirido`,
                    cantidad: detalle.cantidad, // Positivo porque es una entrada
                    producto_id: productoId,
                    sucursal_id: compraData.sucursal_id,
                }, productoActualizado.stock);
            }

            // Paso 8: Retornar la compra completa con todas sus relaciones
            return await this.compraRepository.findOne({
                where: { id: compraId },
                relations: ['sucursal', 'contacto', 'detalles', 'detalles.producto'],
            });
        } catch (error) {
            console.error('Error interno al crear la compra:', error);
            // Si el error ya es un BadRequestException o NotFoundException, lo propagamos
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error al crear la compra. Por favor, verifica los datos e intenta nuevamente.');
        }
    }
    // Find compra by id with relations
    async findById(id: number): Promise<CompraEntity> {
        return await this.compraRepository.findOne({
            where: { id },
            relations: ['sucursal', 'contacto', 'detalles', 'detalles.producto'],
        });
    }

    // Delete single venta
    async deleteVenta(id: number): Promise<void> {
        try {
            // Primero obtenemos la compra con todas sus relaciones
            const compra = await this.compraRepository.findOne({
                where: { id },
                relations: ['detalles', 'detalles.producto', 'sucursal'],
            });

            if (!compra) {
                throw new BadRequestException(`❌ No se encontró la compra con ID ${id} que intentas eliminar.`);
            }

            // PASO 0.5: Crear movimientos de stock tipo AJUSTE_MANUAL para devolver el stock
            // Estos movimientos SÍ modificarán el stock del producto (devolución)
            if (compra.detalles && compra.detalles.length > 0) {
                for (const detalle of compra.detalles) {
                    await this.movimientosStockService.create({
                        tipo_movimiento: TipoMovimientoStock.AJUSTE_MANUAL,
                        descripcion: `Devolución por eliminación de compra #${compra.numero_compra}`,
                        cantidad: -detalle.cantidad, // Cantidad negativa para devolver stock
                        producto_id: detalle.producto.id,
                        sucursal_id: compra.sucursal.id,
                    });
                }
            }

            // PASO 1: Eliminar los detalles de compra primero
            // La restricción FK tiene ON DELETE NO ACTION, así que debemos eliminarlos manualmente
            if (compra.detalles && compra.detalles.length > 0) {
                try {
                    // Eliminar cada detalle usando el repositorio
                    await this.compraRepository
                        .createQueryBuilder()
                        .delete()
                        .from('detalle_compra')
                        .where('compra_id = :compraId', { compraId: id })
                        .execute();
                    
                } catch (detalleError) {
                    console.error(`❌ Error al eliminar detalles:`, detalleError.message);
                    throw new BadRequestException(`Error al eliminar los detalles de compra: ${detalleError.message}`);
                }
            }
            

            // PASO 3: Finalmente eliminamos la compra usando DELETE directo
            // Usamos QueryBuilder en lugar de remove() para evitar problemas de cache
            await this.compraRepository
                .createQueryBuilder()
                .delete()
                .from('compras')
                .where('id = :id', { id })
                .execute();
            
        } catch (error) {
            console.error(`❌ Error en deleteCompra(${id}):`, error.message);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`Error al eliminar la compra: ${error.message}`);
        }
    }

    // Bulk delete compras
    async bulkDeleteCompras(ids: number[], sucursalId?: number): Promise<void> {
        // Obtener todas las compras con sus relaciones
        const compras = await this.compraRepository.find({
            where: { id: In(ids) },
            relations: ['detalles', 'detalles.producto', 'sucursal'],
        });

        // Validar que existan compras
        if (compras.length === 0) {
            throw new BadRequestException('❌ No se encontraron compras con los IDs proporcionados.');
        }

        // Si se proporciona sucursalId, validar que las compras pertenezcan a esa sucursal
        if (sucursalId) {
            const comprasInvalidas = compras.filter(compra => compra.sucursal.id !== sucursalId);
            if (comprasInvalidas.length > 0) {
                throw new BadRequestException('❌ Algunas compras que intentas eliminar no pertenecen a tu sucursal.');
            }
        }

        // Verificar que todas las compras solicitadas fueron encontradas
        if (compras.length !== ids.length) {
            throw new BadRequestException('❌ Algunas compras que intentas eliminar no existen.');
        }

        // PASO 0.5: Crear movimientos de stock tipo AJUSTE_MANUAL para devolver el stock de todas las compras
        // Estos movimientos SÍ modificarán el stock del producto (devolución)
        for (const compra of compras) {
            if (compra.detalles && compra.detalles.length > 0) {
                for (const detalle of compra.detalles) {
                    await this.movimientosStockService.create({
                        tipo_movimiento: TipoMovimientoStock.AJUSTE_MANUAL,
                        descripcion: `Devolución por eliminación de compra #${compra.numero_compra}`,
                        cantidad: -detalle.cantidad, // Cantidad negativa para reducir stock
                        producto_id: detalle.producto.id,
                        sucursal_id: compra.sucursal.id,
                    });
                }
            }
        }

        // PASO 1: Eliminar todos los detalles de las compras primero
        // La restricción FK tiene ON DELETE NO ACTION, así que debemos eliminarlos manualmente
        await this.compraRepository
            .createQueryBuilder()
            .delete()
            .from('detalle_compra')
            .where('compra_id IN (:...ids)', { ids })
            .execute();

        // PASO 5: Finalmente eliminar las compras usando DELETE directo
        await this.compraRepository
            .createQueryBuilder()
            .delete()
            .from('compras')
            .where('id IN (:...ids)', { ids })
            .execute();
        
    }

    // Soft delete (set estado to false instead of hard delete)
    async softDeleteCompra(id: number): Promise<CompraEntity> {
        await this.compraRepository.softDelete(id);
        return await this.findById(id);
    }

    // Bulk soft delete
    async bulkSoftDeleteCompras(ids: number[]): Promise<void> {
        await this.compraRepository.softDelete(ids);
    }



}

