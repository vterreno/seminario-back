import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from 'src/base-service/base-service.service';
import { ventaEntity } from 'src/database/core/venta.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { FindManyOptions, Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { PagoService } from '../pago/pago.service';
import { DetalleVentaService } from '../detalle-venta/detalle-venta.service';
import { MovimientosStockService } from '../movimientos-stock/movimientos-stock.service';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';

@Injectable()
export class VentasService extends BaseService<ventaEntity>{
    findManyOptions: FindManyOptions<ventaEntity> = {};
    findOneOptions: FindManyOptions<ventaEntity> = {};

    constructor(
        @InjectRepository(ventaEntity) 
        protected ventaRepository: Repository<ventaEntity>,
        @InjectRepository(sucursalEntity)
        protected sucursalRepository: Repository<sucursalEntity>,
        private readonly pagoService: PagoService,
        private readonly detalleVentaService: DetalleVentaService,
        private readonly movimientosStockService: MovimientosStockService,
    ){
        super(ventaRepository);
    }

    // Get all ventas (for superadmin)
    async getAllVentas(): Promise<ventaEntity[]> {
        return await this.ventaRepository.find({
            relations: ['sucursal', 'sucursal.empresa', 'contacto', 'pago'],
        });
    }

    // Get ventas filtered by empresa
    async getVentasByEmpresa(empresaId: number): Promise<ventaEntity[]> {
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

        return await this.getVentasBySucursal(sucursalIds);
    }

    // Get ventas filtered by sucursal
    async getVentasBySucursal(sucursalId: number[]): Promise<ventaEntity[]> {
        return await this.ventaRepository.find({
            where: { sucursal: { id: In(sucursalId) } },
            relations: ['sucursal', 'contacto', 'pago'],
        });
    }


    // Create venta
    async createVenta(ventaData: CreateVentaDto): Promise<ventaEntity> {
        try {
            // Paso 1: Verificar que la sucursal existe y obtener su información
            const sucursal = await this.sucursalRepository.findOne({
                where: { id: ventaData.sucursal_id }
            });

            if (!sucursal) {
                throw new NotFoundException(`Sucursal con id ${ventaData.sucursal_id} no encontrada`);
            }

            // Paso 2: Obtener el siguiente número de venta (incrementar el talonario)
            const nuevoNumeroVenta = sucursal.numero_venta + 1;

            // Paso 3: Actualizar el número de venta en la sucursal (incrementar el talonario)
            await this.sucursalRepository.update(sucursal.id, {
                numero_venta: nuevoNumeroVenta
            });

            // Paso 4: Crear el pago primero (porque venta necesita el pago_id)
            const savedPago = await this.pagoService.createPago({
                fecha_pago: new Date(ventaData.pago.fecha_pago),
                monto_pago: ventaData.pago.monto_pago,
                metodo_pago: ventaData.pago.metodo_pago as 'efectivo' | 'transferencia',
                sucursal: { id: ventaData.pago.sucursal_id } as any,
            });

            // Paso 5: Crear la venta sin detalles pero con el número de venta generado
            const venta = this.ventaRepository.create({
                numero_venta: nuevoNumeroVenta, // ← Usar el número generado del talonario
                fecha_venta: new Date(ventaData.fecha_venta),
                monto_total: ventaData.monto_total,
                sucursal: { id: ventaData.sucursal_id } as any,
                contacto: ventaData.contacto_id ? { id: ventaData.contacto_id } as any : undefined,
                pago: savedPago,
            });

            // Paso 6: Guardar la venta
            const savedVenta = await this.ventaRepository.save(venta);

            // Paso 7: Crear los detalles usando el servicio de detalle-venta
            // Esto manejará la validación de stock y actualización automáticamente
            // Y crear movimientos de stock tipo VENTA por cada detalle (solo registro)
            for (const detalle of ventaData.detalles) {
                // Crear el detalle (esto reduce el stock del producto)
                await this.detalleVentaService.createDetalle({
                    ...detalle,
                    venta_id: savedVenta.id, // Asignar la venta recién creada
                });

                // Obtener el producto actualizado para saber el stock resultante
                const productoActualizado = await this.movimientosStockService['productoRepository'].findOne({
                    where: { id: detalle.producto_id }
                });

                // Crear movimiento de stock tipo VENTA (solo registro, no modifica stock)
                await this.movimientosStockService.createMovimientoRegistro({
                    tipo_movimiento: TipoMovimientoStock.VENTA,
                    descripcion: `Venta #${nuevoNumeroVenta} - Producto vendido`,
                    cantidad: -detalle.cantidad, // Negativo porque es una salida
                    producto_id: detalle.producto_id,
                    sucursal_id: ventaData.sucursal_id,
                }, productoActualizado.stock);
            }

            // Paso 8: Retornar la venta completa con todas sus relaciones
            return await this.ventaRepository.findOne({
                where: { id: savedVenta.id },
                relations: ['sucursal', 'contacto', 'detalles', 'detalles.producto', 'pago'],
            });
        } catch (error) {
            console.error('Error interno al crear la venta:', error);
            // Si el error ya es un BadRequestException o NotFoundException, lo propagamos
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Error al crear la venta. Por favor, verifica los datos e intenta nuevamente.');
        }
    }
    // Find venta by id with relations
    async findById(id: number): Promise<ventaEntity> {
        return await this.ventaRepository.findOne({
            where: { id },
            relations: ['sucursal', 'contacto', 'pago', 'detalles', 'detalles.producto'],
        });
    }

    // Delete single venta
    async deleteVenta(id: number): Promise<void> {
        try {
            // Primero obtenemos la venta con todas sus relaciones
            const venta = await this.ventaRepository.findOne({
                where: { id },
                relations: ['detalles', 'detalles.producto', 'pago', 'sucursal'],
            });

            if (!venta) {
                throw new BadRequestException(`❌ No se encontró la venta con ID ${id} que intentas eliminar.`);
            }

            // PASO 0.5: Crear movimientos de stock tipo AJUSTE_MANUAL para devolver el stock
            // Estos movimientos SÍ modificarán el stock del producto (devolución)
            if (venta.detalles && venta.detalles.length > 0) {
                for (const detalle of venta.detalles) {
                    await this.movimientosStockService.create({
                        tipo_movimiento: TipoMovimientoStock.AJUSTE_MANUAL,
                        descripcion: `Devolución por eliminación de venta #${venta.numero_venta}`,
                        cantidad: detalle.cantidad, // Cantidad positiva para devolver stock
                        producto_id: detalle.producto.id,
                        sucursal_id: venta.sucursal.id,
                    });
                }
            }

            // PASO 1: Eliminar los detalles de venta primero
            // La restricción FK tiene ON DELETE NO ACTION, así que debemos eliminarlos manualmente
            if (venta.detalles && venta.detalles.length > 0) {
                try {
                    // Eliminar cada detalle usando el repositorio
                    await this.ventaRepository
                        .createQueryBuilder()
                        .delete()
                        .from('detalle_venta')
                        .where('venta_id = :ventaId', { ventaId: id })
                        .execute();
                    
                } catch (detalleError) {
                    console.error(`❌ Error al eliminar detalles:`, detalleError.message);
                    throw new BadRequestException(`Error al eliminar los detalles de venta: ${detalleError.message}`);
                }
            }

            // PASO 2: Desvincular y eliminar el pago si existe
            const pagoId = venta.pago?.id;
            if (pagoId) {
                try {
                    // Desvinculamos el pago usando UPDATE directo para evitar problemas de cache
                    await this.ventaRepository
                        .createQueryBuilder()
                        .update('ventas')
                        .set({ pago: null })
                        .where('id = :id', { id })
                        .execute();
                    
                    
                    // Ahora eliminamos el pago
                    await this.pagoService.deletePago(pagoId);
                    
                } catch (pagoError) {
                    console.error(`❌ Error al eliminar el pago ${pagoId}:`, pagoError.message);
                    throw new BadRequestException(`Error al eliminar el pago asociado: ${pagoError.message}`);
                }
            }

            // PASO 3: Finalmente eliminamos la venta usando DELETE directo
            // Usamos QueryBuilder en lugar de remove() para evitar problemas de cache
            await this.ventaRepository
                .createQueryBuilder()
                .delete()
                .from('ventas')
                .where('id = :id', { id })
                .execute();
            
        } catch (error) {
            console.error(`❌ Error en deleteVenta(${id}):`, error.message);
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`Error al eliminar la venta: ${error.message}`);
        }
    }

    // Bulk delete ventas
    async bulkDeleteVentas(ids: number[]): Promise<void> {
        // Obtener todas las ventas con sus relaciones
        const ventas = await this.ventaRepository.find({
            where: { id: In(ids) },
            relations: ['detalles', 'detalles.producto', 'pago', 'sucursal'],
        });

        // Validar que existan ventas
        if (ventas.length === 0) {
            throw new BadRequestException('❌ No se encontraron ventas con los IDs proporcionados.');
        }

        // Verificar que todas las ventas solicitadas fueron encontradas
        if (ventas.length !== ids.length) {
            throw new BadRequestException('❌ Algunas ventas que intentas eliminar no existen.');
        }

        // PASO 0.5: Crear movimientos de stock tipo AJUSTE_MANUAL para devolver el stock de todas las ventas
        // Estos movimientos SÍ modificarán el stock del producto (devolución)
        for (const venta of ventas) {
            if (venta.detalles && venta.detalles.length > 0) {
                for (const detalle of venta.detalles) {
                    await this.movimientosStockService.create({
                        tipo_movimiento: TipoMovimientoStock.AJUSTE_MANUAL,
                        descripcion: `Devolución por eliminación de venta #${venta.numero_venta}`,
                        cantidad: detalle.cantidad, // Cantidad positiva para devolver stock
                        producto_id: detalle.producto.id,
                        sucursal_id: venta.sucursal.id,
                    });
                }
            }
        }

        // PASO 1: Eliminar todos los detalles de las ventas primero
        // La restricción FK tiene ON DELETE NO ACTION, así que debemos eliminarlos manualmente
        await this.ventaRepository
            .createQueryBuilder()
            .delete()
            .from('detalle_venta')
            .where('venta_id IN (:...ids)', { ids })
            .execute();

        console.log(`✅ Detalles de ${ids.length} venta(s) eliminados`);

        // PASO 2: Recolectar todos los IDs de pagos antes de eliminar las ventas
        const pagoIds = ventas
            .filter(venta => venta.pago)
            .map(venta => venta.pago.id);

        // PASO 3: Desvincular los pagos de todas las ventas usando UPDATE directo
        if (pagoIds.length > 0) {
            await this.ventaRepository
                .createQueryBuilder()
                .update('ventas')
                .set({ pago: null })
                .where('id IN (:...ids)', { ids })
                .execute();
            

            // PASO 4: Eliminar los pagos asociados
            await this.pagoService.bulkDeletePagos(pagoIds);
            console.log(`✅ ${pagoIds.length} pago(s) eliminado(s)`);
        }

        // PASO 5: Finalmente eliminar las ventas usando DELETE directo
        await this.ventaRepository
            .createQueryBuilder()
            .delete()
            .from('ventas')
            .where('id IN (:...ids)', { ids })
            .execute();
        
        console.log(`✅ ${ids.length} venta(s) eliminada(s) exitosamente`);
    }

    // Soft delete (set estado to false instead of hard delete)
    async softDeleteVenta(id: number): Promise<ventaEntity> {
        await this.ventaRepository.softDelete(id);
        return await this.findById(id);
    }

    // Bulk soft delete
    async bulkSoftDeleteVentas(ids: number[]): Promise<void> {
        await this.ventaRepository.softDelete(ids);
    }



}
