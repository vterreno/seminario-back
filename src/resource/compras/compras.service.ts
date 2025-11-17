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
import { PagoService } from '../pago/pago.service';
import { EstadoCompra } from 'src/database/core/enums/EstadoCompra.enum';

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
        private readonly pagoService: PagoService,
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

            // Paso 7: Crear los detalles usando el servicio de detalle-compra
            // Esto manejará la actualización del stock automáticamente
            // Y crear movimientos de stock tipo COMPRA por cada detalle (solo registro)
            for (const detalle of compraData.detalles) {
                // Crear el detalle (esto suma el stock del producto)
                await this.detalleCompraService.createDetalle({
                    ...detalle,
                    compra_id: compraId, // Asignar la compra recién creada
                });

                // Obtener el producto actualizado para saber el stock resultante
                // Necesitamos obtener el producto_id desde la relación producto-proveedor
                const productoProveedor = await this.productoProveedorRepository.findOne({
                    where: { id: detalle.producto_proveedor_id },
                    relations: ['producto']
                });

                if (!productoProveedor) {
                    throw new NotFoundException(`Relación producto-proveedor con id ${detalle.producto_proveedor_id} no encontrada`);
                }

                const productoActualizado = await this.productoRepository.findOne({
                    where: { id: productoProveedor.producto_id }
                });

                if (!productoActualizado) {
                    throw new NotFoundException(`Producto con id ${productoProveedor.producto_id} no encontrado`);
                }

                // Crear movimiento de stock tipo COMPRA (solo registro, no modifica stock)
                await this.movimientosStockService.createMovimientoRegistro({
                    tipo_movimiento: TipoMovimientoStock.COMPRA,
                    descripcion: `Compra #${nuevoNumeroCompra} - Producto adquirido`,
                    cantidad: detalle.cantidad, // Positivo porque es una entrada
                    producto_id: productoProveedor.producto_id,
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
            relations: ['sucursal', 'contacto', 'detalles', 'detalles.producto', 'detalles.producto.producto', 'pago'],
        });
    }

    // Asociar pago a compra
    async asociarPagoACompra(compraId: number, pagoData: { fecha_pago: string | Date; monto_pago: number; metodo_pago: 'efectivo' | 'transferencia'; sucursal_id: number }): Promise<CompraEntity> {
        try {
            // Paso 1: Verificar que la compra existe
            const compra = await this.compraRepository.findOne({
                where: { id: compraId },
                relations: ['pago', 'sucursal', 'sucursal.empresa'],
            });

            if (!compra) {
                throw new NotFoundException(`Compra con id ${compraId} no encontrada`);
            }

            // Paso 2: Validar que la compra esté en estado PENDIENTE_PAGO
            if (compra.estado !== EstadoCompra.PENDIENTE_PAGO) {
                throw new BadRequestException(`La compra debe estar en estado PENDIENTE_PAGO para asociar un pago. Estado actual: ${compra.estado}`);
            }

            // Paso 3: Validar que la compra no tenga un pago asociado
            if (compra.pago) {
                throw new BadRequestException('La compra ya tiene un pago asociado');
            }

            // Paso 4: Crear el pago
            const savedPago = await this.pagoService.createPago({
                fecha_pago: new Date(pagoData.fecha_pago),
                monto_pago: pagoData.monto_pago,
                metodo_pago: pagoData.metodo_pago,
                sucursal: { id: pagoData.sucursal_id } as any,
            });

            // Paso 5: Asociar el pago a la compra y cambiar el estado a PAGADO
            await this.compraRepository.update(compraId, {
                pago: savedPago,
                estado: EstadoCompra.PAGADO,
            });

            // Paso 6: Retornar la compra actualizada con todas sus relaciones
            return await this.findById(compraId);
        } catch (error) {
            console.error('Error al asociar pago a compra:', error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error al asociar el pago a la compra. Por favor, verifica los datos e intenta nuevamente.');
        }
    }

    // Update compra
    async updateCompra(id: number, updateData: Partial<CreateCompraDto>): Promise<CompraEntity> {
        try {
            // Paso 1: Verificar que la compra existe y obtener sus detalles actuales
            const compraExistente = await this.compraRepository.findOne({
                where: { id },
                relations: ['detalles', 'detalles.producto', 'detalles.producto.producto', 'sucursal'],
            });

            if (!compraExistente) {
                throw new NotFoundException(`Compra con id ${id} no encontrada`);
            }

            // Paso 2: VALIDAR que la compra esté en estado PENDIENTE_PAGO
            if (compraExistente.estado !== EstadoCompra.PENDIENTE_PAGO) {
                throw new BadRequestException(`Solo se pueden modificar compras en estado PENDIENTE_PAGO. Estado actual: ${compraExistente.estado}`);
            }

            // Paso 3: Si se actualizan los detalles, gestionar el stock y los detalles
            if (updateData.detalles && updateData.detalles.length > 0) {
                // 3.0: VALIDAR que hay suficiente stock para revertir los detalles antiguos
                for (const detalleAntiguo of compraExistente.detalles) {
                    const productoProveedor = await this.productoProveedorRepository.findOne({
                        where: { id: detalleAntiguo.producto.id },
                        relations: ['producto']
                    });

                    if (productoProveedor) {
                        const producto = await this.productoRepository.findOne({
                            where: { id: productoProveedor.producto_id },
                            relations: ['sucursal']
                        });

                        if (producto) {
                            // Validar que el stock actual sea suficiente para revertir
                            if (producto.stock < detalleAntiguo.cantidad) {
                                throw new BadRequestException(
                                    `No se puede modificar la compra. El producto "${productoProveedor.producto.nombre}" tiene un stock actual de ${producto.stock}, ` +
                                    `pero se necesitan ${detalleAntiguo.cantidad} unidades disponibles para poder modificar esta compra. ` +
                                    `El stock de este producto ya ha sido vendido o ajustado.`
                                );
                            }
                        }
                    }
                }

                // 3.1: Revertir el stock de los detalles antiguos
                for (const detalleAntiguo of compraExistente.detalles) {
                    // Obtener el producto_id desde la relación producto-proveedor
                    const productoProveedor = await this.productoProveedorRepository.findOne({
                        where: { id: detalleAntiguo.producto.id },
                        relations: ['producto']
                    });

                    if (productoProveedor) {
                        const producto = await this.productoRepository.findOne({
                            where: { id: productoProveedor.producto_id },
                            relations: ['sucursal']
                        });

                        if (producto) {
                            // Restar el stock que se había sumado con la compra original
                            producto.stock -= detalleAntiguo.cantidad;
                            await this.productoRepository.save(producto);

                            // Crear movimiento de stock tipo AJUSTE_MANUAL para registrar la reversión
                            // Usar la sucursal del producto para evitar error de validación
                            await this.movimientosStockService.createMovimientoRegistro({
                                tipo_movimiento: TipoMovimientoStock.AJUSTE_MANUAL,
                                descripcion: `Ajuste por modificación de compra #${compraExistente.numero_compra}`,
                                cantidad: -detalleAntiguo.cantidad,
                                producto_id: productoProveedor.producto_id,
                                sucursal_id: producto.sucursal.id,
                            }, producto.stock);
                        }
                    }
                }

                // 3.2: Eliminar todos los detalles antiguos en una sola operación (mejor performance)
                await this.compraRepository
                    .createQueryBuilder()
                    .delete()
                    .from('detalle_compra')
                    .where('compra_id = :compraId', { compraId: id })
                    .execute();

                // 3.3: Crear los nuevos detalles y actualizar el stock
                for (const nuevoDetalle of updateData.detalles) {
                    // Crear el detalle (esto suma el stock del producto automáticamente)
                    await this.detalleCompraService.createDetalle({
                        ...nuevoDetalle,
                        compra_id: id,
                    });

                    // Obtener el producto actualizado para registrar el movimiento
                    const productoProveedor = await this.productoProveedorRepository.findOne({
                        where: { id: nuevoDetalle.producto_proveedor_id },
                        relations: ['producto']
                    });

                    if (productoProveedor) {
                        const productoActualizado = await this.productoRepository.findOne({
                            where: { id: productoProveedor.producto_id },
                            relations: ['sucursal']
                        });

                        if (productoActualizado) {
                            // Crear movimiento de stock tipo COMPRA para el nuevo detalle
                            // Usar la sucursal del producto para evitar error de validación
                            await this.movimientosStockService.createMovimientoRegistro({
                                tipo_movimiento: TipoMovimientoStock.COMPRA,
                                descripcion: `Compra #${compraExistente.numero_compra} - Producto actualizado`,
                                cantidad: nuevoDetalle.cantidad,
                                producto_id: productoProveedor.producto_id,
                                sucursal_id: productoActualizado.sucursal.id,
                            }, productoActualizado.stock);
                        }
                    }
                }
            }

            // Paso 4: Actualizar los campos de la compra (fecha, número de factura, observaciones, monto_total)
            const updateFields: any = {};
            
            if (updateData.fecha_compra !== undefined) {
                updateFields.fecha_compra = new Date(updateData.fecha_compra);
            }
            if (updateData.numero_factura !== undefined) {
                updateFields.numero_factura = updateData.numero_factura;
            }
            if (updateData.observaciones !== undefined) {
                updateFields.observaciones = updateData.observaciones;
            }
            if (updateData.monto_total !== undefined) {
                updateFields.monto_total = updateData.monto_total;
            }

            // Solo actualizar si hay campos para actualizar
            if (Object.keys(updateFields).length > 0) {
                await this.compraRepository.update(id, updateFields);
            }

            // Paso 5: Retornar la compra actualizada con todas sus relaciones
            return await this.findById(id);
        } catch (error) {
            console.error('Error al actualizar la compra:', error);
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error al actualizar la compra. Por favor, verifica los datos e intenta nuevamente.');
        }
    }

    // Delete single compra
    async deleteCompra(id: number): Promise<void> {
        try {
            // Primero obtenemos la compra con todas sus relaciones
            const compra = await this.compraRepository.findOne({
                where: { id },
                relations: ['detalles', 'detalles.producto', 'detalles.producto.producto', 'sucursal'],
            });

            if (!compra) {
                throw new BadRequestException(`❌ No se encontró la compra con ID ${id} que intentas eliminar.`);
            }

            // PASO 0: Validar que hay suficiente stock para devolver
            // Al eliminar una compra, debemos restar el stock que se sumó, pero primero validamos que exista
            if (compra.detalles && compra.detalles.length > 0) {
                for (const detalle of compra.detalles) {
                    const productoProveedor = await this.productoProveedorRepository.findOne({
                        where: { id: detalle.producto.id },
                        relations: ['producto']
                    });

                    if (productoProveedor) {
                        const producto = await this.productoRepository.findOne({
                            where: { id: productoProveedor.producto_id },
                            relations: ['sucursal']
                        });

                        if (producto) {
                            // Validar que el stock actual sea suficiente para devolver
                            if (producto.stock < detalle.cantidad) {
                                throw new BadRequestException(
                                    `No se puede eliminar la compra. El producto "${productoProveedor.producto.nombre}" tiene un stock actual de ${producto.stock}, ` +
                                    `pero se necesitan ${detalle.cantidad} unidades disponibles para poder eliminar esta compra. ` +
                                    `El stock de este producto ya ha sido vendido o ajustado.`
                                );
                            }
                        }
                    }
                }
            }

            // PASO 0.5: Crear movimientos de stock tipo AJUSTE_MANUAL para devolver el stock
            // Estos movimientos SÍ modificarán el stock del producto (devolución)
            if (compra.detalles && compra.detalles.length > 0) {
                for (const detalle of compra.detalles) {
                    // Obtener el producto_id desde la relación producto-proveedor
                    const productoProveedor = await this.productoProveedorRepository.findOne({
                        where: { id: detalle.producto.id },
                        relations: ['producto']
                    });

                    if (productoProveedor) {
                        const producto = await this.productoRepository.findOne({
                            where: { id: productoProveedor.producto_id },
                            relations: ['sucursal']
                        });

                        if (producto) {
                            await this.movimientosStockService.create({
                                tipo_movimiento: TipoMovimientoStock.AJUSTE_MANUAL,
                                descripcion: `Devolución por eliminación de compra #${compra.numero_compra}`,
                                cantidad: -detalle.cantidad, // Cantidad negativa para devolver stock
                                producto_id: productoProveedor.producto_id,
                                sucursal_id: producto.sucursal.id,
                            });
                        }
                    }
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
    async bulkDeleteCompras(ids: number[], empresaId?: number): Promise<void> {
        // Obtener todas las compras con sus relaciones
        const compras = await this.compraRepository.find({
            where: { id: In(ids) },
            relations: ['detalles', 'detalles.producto', 'detalles.producto.producto', 'sucursal', 'sucursal.empresa'],
        });

        // Validar que existan compras
        if (compras.length === 0) {
            throw new BadRequestException('❌ No se encontraron compras con los IDs proporcionados.');
        }

        // Si se proporciona empresaId, validar que las compras pertenezcan a esa empresa
        if (empresaId) {
            const comprasInvalidas = compras.filter(compra => compra.sucursal?.empresa?.id !== empresaId);
            if (comprasInvalidas.length > 0) {
                throw new BadRequestException('❌ Algunas compras que intentas eliminar no pertenecen a tu empresa.');
            }
        }

        // Verificar que todas las compras solicitadas fueron encontradas
        if (compras.length !== ids.length) {
            throw new BadRequestException('❌ Algunas compras que intentas eliminar no existen.');
        }

        // PASO 0: Validar que hay suficiente stock para devolver en todas las compras
        // Al eliminar compras, debemos restar el stock que se sumó, pero primero validamos que exista
        for (const compra of compras) {
            if (compra.detalles && compra.detalles.length > 0) {
                for (const detalle of compra.detalles) {
                    const productoProveedor = await this.productoProveedorRepository.findOne({
                        where: { id: detalle.producto.id },
                        relations: ['producto']
                    });

                    if (productoProveedor) {
                        const producto = await this.productoRepository.findOne({
                            where: { id: productoProveedor.producto_id },
                            relations: ['sucursal']
                        });

                        if (producto) {
                            // Validar que el stock actual sea suficiente para devolver
                            if (producto.stock < detalle.cantidad) {
                                throw new BadRequestException(
                                    `No se pueden eliminar las compras. El producto "${productoProveedor.producto.nombre}" tiene un stock actual de ${producto.stock}, ` +
                                    `pero se necesitan ${detalle.cantidad} unidades disponibles para poder eliminar la compra #${compra.numero_compra}. ` +
                                    `El stock de este producto ya ha sido vendido o ajustado.`
                                );
                            }
                        }
                    }
                }
            }
        }

        // PASO 0.5: Crear movimientos de stock tipo AJUSTE_MANUAL para devolver el stock de todas las compras
        // Estos movimientos SÍ modificarán el stock del producto (devolución)
        for (const compra of compras) {
            if (compra.detalles && compra.detalles.length > 0) {
                for (const detalle of compra.detalles) {
                    // Obtener el producto_id desde la relación producto-proveedor
                    const productoProveedor = await this.productoProveedorRepository.findOne({
                        where: { id: detalle.producto.id },
                        relations: ['producto']
                    });

                    if (productoProveedor) {
                        const producto = await this.productoRepository.findOne({
                            where: { id: productoProveedor.producto_id },
                            relations: ['sucursal']
                        });

                        if (producto) {
                            await this.movimientosStockService.create({
                                tipo_movimiento: TipoMovimientoStock.AJUSTE_MANUAL,
                                descripcion: `Devolución por eliminación de compra #${compra.numero_compra}`,
                                cantidad: -detalle.cantidad, // Cantidad negativa para reducir stock
                                producto_id: productoProveedor.producto_id,
                                sucursal_id: producto.sucursal.id,
                            });
                        }
                    }
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

