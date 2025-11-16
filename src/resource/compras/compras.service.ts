import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { BaseService } from 'src/base-service/base-service.service';
import { CompraEntity } from 'src/database/core/compra.entity';
import { DetalleCompraEntity } from 'src/database/core/detalleCompra.entity';
import { DataSource, FindManyOptions, In, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { DetalleCompraService } from '../detalle-compra/detalle-compra.service';
import { MovimientosStockService } from '../movimientos-stock/movimientos-stock.service';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';
import { EstadoCompra } from 'src/database/core/enums/EstadoCompra.enum';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { ProductoProveedorService } from '../producto-proveedor/producto-proveedor.service';
import { ProductosService } from '../productos/productos.service';

// Constante para el margen de ganancia por defecto (30%)
const DEFAULT_PRICE_MARKUP = 1.3;

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
        private dataSource: DataSource,
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
        // Usar QueryRunner para manejar transacciones
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Paso 1: Verificar que la sucursal existe y obtener su información
            const sucursal = await queryRunner.manager.findOne(sucursalEntity, {
                where: { id: compraData.sucursal_id }
            });

            if (!sucursal) {
                throw new NotFoundException(`Sucursal con id ${compraData.sucursal_id} no encontrada`);
            }

            // Paso 2: Obtener el siguiente número de compra (incrementar el talonario)
            const nuevoNumeroCompra = sucursal.numero_compra + 1;
            
            // Paso 3: Actualizar el número de compra en la sucursal (incrementar el talonario)
            await queryRunner.manager.update(sucursalEntity, sucursal.id, {
                numero_compra: nuevoNumeroCompra
            });

            // Paso 4: Crear la compra sin detalles pero con el número de compra generado
            const compra: Partial<CompraEntity> = {
                numero_compra: nuevoNumeroCompra,
                fecha_compra: new Date(compraData.fecha_compra),
                monto_total: compraData.monto_total,
                sucursal: { id: compraData.sucursal_id } as sucursalEntity,
                contacto: compraData.contacto_id ? { id: compraData.contacto_id } as contactoEntity : undefined,
                estado: compraData.estado || EstadoCompra.PENDIENTE_PAGO,
                numero_factura: compraData.numero_factura,
                observaciones: compraData.observaciones,
            };

            // Paso 5: Guardar la compra
            const savedCompra = await queryRunner.manager.save(CompraEntity, compra);
            const compraId = savedCompra.id;

            // Paso 6: Crear nuevos productos si se proporcionaron
            const productosCreados = new Map<string, number>(); // codigo -> producto_id
            
            if (compraData.nuevos_productos && compraData.nuevos_productos.length > 0) {
                // Obtener todos los códigos de productos nuevos para verificar existencia en una sola consulta
                const codigosNuevos = compraData.nuevos_productos.map(p => p.codigo);
                const productosExistentes = await queryRunner.manager.find(ProductoEntity, {
                    where: { 
                        codigo: In(codigosNuevos),
                        sucursal_id: compraData.sucursal_id 
                    }
                });

                const codigosExistentes = new Set(productosExistentes.map(p => p.codigo));

                for (const nuevoProducto of compraData.nuevos_productos) {
                    let productoId: number;

                    // Si el producto ya existe, usarlo en lugar de crear uno nuevo
                    if (codigosExistentes.has(nuevoProducto.codigo)) {
                        const productoExistente = productosExistentes.find(p => p.codigo === nuevoProducto.codigo);
                        if (!productoExistente) {
                            throw new NotFoundException(`Producto con código ${nuevoProducto.codigo} no encontrado`);
                        }
                        productoId = productoExistente.id;
                        productosCreados.set(nuevoProducto.codigo, productoId);
                    } else {
                        // Buscar en los detalles la cantidad comprada de este nuevo producto
                        const detalleAsociado = compraData.detalles.find(
                            d => d.codigo_producto_temp === nuevoProducto.codigo
                        );
                        const cantidadComprada = detalleAsociado ? detalleAsociado.cantidad : 0;

                        // Crear el producto con stock_apertura = cantidad_comprada
                        const productoCreado = queryRunner.manager.create(ProductoEntity, {
                            codigo: nuevoProducto.codigo,
                            nombre: nuevoProducto.nombre,
                            marca_id: nuevoProducto.marca_id,
                            categoria_id: nuevoProducto.categoria_id,
                            unidad_medida_id: nuevoProducto.unidad_medida_id,
                            precio_costo: nuevoProducto.precio_proveedor,
                            precio_venta: nuevoProducto.precio_proveedor * DEFAULT_PRICE_MARKUP,
                            stock_apertura: cantidadComprada,
                            stock: cantidadComprada,
                            sucursal_id: compraData.sucursal_id,
                            estado: true,
                        });

                        const savedProducto = await queryRunner.manager.save(ProductoEntity, productoCreado);
                        productoId = savedProducto.id;
                        productosCreados.set(nuevoProducto.codigo, productoId);
                    }

                    // Verificar si la relación producto-proveedor ya existe
                    const relacionExistente = await queryRunner.manager.findOne(ProductoProveedorEntity, {
                        where: {
                            producto_id: productoId,
                            proveedor_id: nuevoProducto.proveedor_id,
                            deleted_at: IsNull()
                        }
                    });

                    // Solo crear la relación si no existe
                    if (!relacionExistente) {
                        const productoProveedor = queryRunner.manager.create(ProductoProveedorEntity, {
                            producto_id: productoId,
                            proveedor_id: nuevoProducto.proveedor_id,
                            precio_proveedor: nuevoProducto.precio_proveedor,
                            codigo_proveedor: nuevoProducto.codigo_proveedor,
                        });
                        await queryRunner.manager.save(ProductoProveedorEntity, productoProveedor);
                    }
                }
            }

            // Paso 7: Obtener todos los productos-proveedor necesarios en una sola consulta
            const productosProveedorIds = compraData.detalles
                .filter(d => d.producto_proveedor_id)
                .map(d => d.producto_proveedor_id!);

            const productosProveedorMap = new Map<number, ProductoProveedorEntity>();
            
            if (productosProveedorIds.length > 0) {
                const productosProveedor = await queryRunner.manager.find(ProductoProveedorEntity, {
                    where: { id: In(productosProveedorIds) },
                    relations: ['producto']
                });
                
                productosProveedor.forEach(pp => {
                    productosProveedorMap.set(pp.id, pp);
                });
            }

            // Paso 8: Crear los detalles y movimientos de stock
            const productosIds = new Set<number>();

            for (const detalle of compraData.detalles) {
                let productoId: number;
                let productoProveedorId: number;

                // Determinar el producto_id y producto_proveedor_id según el tipo de detalle
                if (detalle.codigo_producto_temp) {
                    // Producto nuevo creado en esta transacción
                    const productoIdTemp = productosCreados.get(detalle.codigo_producto_temp);
                    
                    if (!productoIdTemp) {
                        throw new NotFoundException(`Producto con código ${detalle.codigo_producto_temp} no encontrado después de crearlo`);
                    }

                    productoId = productoIdTemp;

                    // Buscar la relación producto-proveedor recién creada
                    const productoProveedorNuevo = await queryRunner.manager.findOne(ProductoProveedorEntity, {
                        where: {
                            producto_id: productoId,
                            proveedor_id: compraData.contacto_id,
                            deleted_at: IsNull()
                        }
                    });

                    if (!productoProveedorNuevo) {
                        throw new NotFoundException(
                            `No se encontró la relación producto-proveedor para el producto recién creado con id ${productoId}`
                        );
                    }

                    productoProveedorId = productoProveedorNuevo.id;
                } else if (detalle.producto_proveedor_id) {
                    // Relación producto-proveedor proporcionada directamente
                    const productoProveedor = productosProveedorMap.get(detalle.producto_proveedor_id);

                    if (!productoProveedor) {
                        throw new NotFoundException(`Relación producto-proveedor con id ${detalle.producto_proveedor_id} no encontrada`);
                    }

                    productoId = productoProveedor.producto_id;
                    productoProveedorId = productoProveedor.id;
                } else if (detalle.producto_id) {
                    // Solo producto_id proporcionado, buscar la relación
                    productoId = detalle.producto_id;

                    const productoProveedorExistente = await queryRunner.manager.findOne(ProductoProveedorEntity, {
                        where: {
                            producto_id: productoId,
                            proveedor_id: compraData.contacto_id,
                            deleted_at: IsNull()
                        }
                    });

                    if (!productoProveedorExistente) {
                        throw new BadRequestException(
                            `No existe relación producto-proveedor para el producto con id ${productoId} y el proveedor seleccionado`
                        );
                    }

                    productoProveedorId = productoProveedorExistente.id;
                } else {
                    throw new BadRequestException('Debe proporcionar producto_proveedor_id, producto_id o codigo_producto_temp en los detalles');
                }

                productosIds.add(productoId);

                // Crear el detalle directamente con queryRunner (dentro de la transacción)
                const detalleEntity = queryRunner.manager.create(DetalleCompraEntity, {
                    compra: { id: compraId } as CompraEntity,
                    producto: { id: productoProveedorId } as ProductoProveedorEntity,
                    cantidad: detalle.cantidad,
                    precio_unitario: detalle.precio_unitario,
                    subtotal: detalle.subtotal,
                });

                await queryRunner.manager.save(DetalleCompraEntity, detalleEntity);

                // Actualizar el stock del producto (SUMAR la cantidad comprada)
                await queryRunner.manager.increment(
                    ProductoEntity,
                    { id: productoId },
                    'stock',
                    detalle.cantidad
                );
            }

            // Paso 9: Obtener todos los productos actualizados en una sola consulta
            const productosActualizados = await queryRunner.manager.find(ProductoEntity, {
                where: { id: In(Array.from(productosIds)) }
            });

            const productosMap = new Map<number, ProductoEntity>();
            productosActualizados.forEach(p => {
                productosMap.set(p.id, p);
            });

            // Paso 10: Crear movimientos de stock
            for (const detalle of compraData.detalles) {
                let productoId: number;

                if (detalle.codigo_producto_temp) {
                    productoId = productosCreados.get(detalle.codigo_producto_temp)!;
                } else if (detalle.producto_proveedor_id) {
                    productoId = productosProveedorMap.get(detalle.producto_proveedor_id)!.producto_id;
                } else {
                    productoId = detalle.producto_id!;
                }

                const productoActualizado = productosMap.get(productoId);

                if (!productoActualizado) {
                    throw new NotFoundException(`Producto con id ${productoId} no encontrado`);
                }

                // Crear movimiento de stock tipo COMPRA (solo registro, no modifica stock)
                await this.movimientosStockService.createMovimientoRegistro({
                    tipo_movimiento: TipoMovimientoStock.COMPRA,
                    descripcion: `Compra #${nuevoNumeroCompra} - Producto adquirido`,
                    cantidad: detalle.cantidad,
                    producto_id: productoId,
                    sucursal_id: compraData.sucursal_id,
                }, productoActualizado.stock);
            }

            // Confirmar la transacción
            await queryRunner.commitTransaction();

            // Paso 11: Retornar la compra completa con todas sus relaciones
            return await this.compraRepository.findOne({
                where: { id: compraId },
                relations: ['sucursal', 'contacto', 'detalles', 'detalles.producto'],
            });
        } catch (error) {
            // Revertir la transacción en caso de error
            await queryRunner.rollbackTransaction();
            console.error('Error interno al crear la compra:', error);
            
            // Si el error ya es un BadRequestException o NotFoundException, lo propagamos
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error al crear la compra. Por favor, verifica los datos e intenta nuevamente.');
        } finally {
            // Liberar el queryRunner
            await queryRunner.release();
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

