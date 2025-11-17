import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompraEntity } from 'src/database/core/compra.entity';
import { DetalleCompraEntity } from 'src/database/core/detalleCompra.entity';
import { pagoEntity } from 'src/database/core/pago.entity';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';
import { EstadoCompra } from 'src/database/core/enums/EstadoCompra.enum';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';

@Injectable()
export class CompraSeeder {
    constructor(
        @InjectRepository(CompraEntity)
        private readonly compraRepo: Repository<CompraEntity>,
        @InjectRepository(DetalleCompraEntity)
        private readonly detalleCompraRepo: Repository<DetalleCompraEntity>,
        @InjectRepository(pagoEntity)
        private readonly pagoRepo: Repository<pagoEntity>,
        @InjectRepository(ProductoProveedorEntity)
        private readonly productoProveedorRepo: Repository<ProductoProveedorEntity>,
        @InjectRepository(sucursalEntity)
        private readonly sucursalRepo: Repository<sucursalEntity>,
        @InjectRepository(contactoEntity)
        private readonly contactoRepo: Repository<contactoEntity>,
        @InjectRepository(MovimientoStockEntity)
        private readonly movimientoStockRepo: Repository<MovimientoStockEntity>,
        @InjectRepository(ProductoEntity)
        private readonly productoRepo: Repository<ProductoEntity>,
        @InjectRepository(empresaEntity)
        private readonly empresaRepo: Repository<empresaEntity>,
    ) {}

    async run() {
        console.log('🛒 Iniciando seed de compras...');
        
        // Verificar si ya existen compras
        const existingCompras = await this.compraRepo.count();
        if (existingCompras > 0) {
            console.log('🛒 Las compras ya existen, saltando seeder de compras');
            return;
        }

        // Obtener todas las empresas
        const empresas = await this.empresaRepo.find({ where: { estado: true } });
        if (empresas.length === 0) {
            console.log('❌ No se encontraron empresas activas para asignar compras');
            return;
        }

        console.log(`✅ Empresas encontradas: ${empresas.length}`);

        // Fecha base para las compras (últimos 60 días)
        const fechaBase = new Date();

        // Procesar cada empresa
        for (const empresa of empresas) {
            console.log(`\n🏢 Procesando compras para empresa: ${empresa.name}`);

            // Obtener sucursales de la empresa
            const sucursales = await this.sucursalRepo.find({ 
                where: { empresa_id: empresa.id, estado: true } 
            });

            if (sucursales.length === 0) {
                console.log(`   ⚠️  No se encontraron sucursales activas para ${empresa.name}`);
                continue;
            }

            // Obtener proveedores de la empresa
            const proveedores = await this.contactoRepo.find({
                where: { 
                    empresa_id: empresa.id,
                    rol: 'proveedor',
                    estado: true 
                }
            });

            if (proveedores.length === 0) {
                console.log(`   ⚠️  No se encontraron proveedores para ${empresa.name}`);
                continue;
            }

            console.log(`   📍 Sucursales activas: ${sucursales.length}`);
            console.log(`   🏭 Proveedores disponibles: ${proveedores.length}`);

            // Generar compras para cada sucursal
            for (const sucursal of sucursales) {
                console.log(`\n   📦 Creando compras para sucursal: ${sucursal.nombre}`);

                // Obtener productos de esta sucursal con sus relaciones de proveedor
                const productosProveedor = await this.productoProveedorRepo
                    .createQueryBuilder('pp')
                    .innerJoin('pp.producto', 'producto')
                    .innerJoin('producto.sucursal', 'sucursal')
                    .where('sucursal.id = :sucursalId', { sucursalId: sucursal.id })
                    .andWhere('pp.proveedor_id IN (:...proveedorIds)', { 
                        proveedorIds: proveedores.map(p => p.id) 
                    })
                    .leftJoinAndSelect('pp.producto', 'prod')
                    .leftJoinAndSelect('pp.proveedor', 'prov')
                    .getMany();

                if (productosProveedor.length === 0) {
                    console.log(`      ⚠️  No hay productos con proveedores para esta sucursal`);
                    continue;
                }

                console.log(`      ✅ Productos con proveedores: ${productosProveedor.length}`);

                // Generar entre 8 y 15 compras por sucursal
                const cantidadCompras = Math.floor(Math.random() * 8) + 8;
                const fechasCompras = this.generarFechasCronologicas(cantidadCompras, fechaBase);

                let comprasCreadas = 0;

                for (let numeroCompraActual = 1; numeroCompraActual <= cantidadCompras; numeroCompraActual++) {
                    try {
                        const fechaCompra = fechasCompras[numeroCompraActual - 1];

                        // Seleccionar un proveedor aleatorio
                        const proveedor = proveedores[Math.floor(Math.random() * proveedores.length)];

                        // Filtrar productos de este proveedor
                        const productosDelProveedor = productosProveedor.filter(
                            pp => pp.proveedor_id === proveedor.id
                        );

                        if (productosDelProveedor.length === 0) {
                            console.log(`      ⚠️  El proveedor ${proveedor.nombre_razon_social} no tiene productos`);
                            continue;
                        }

                        // Decidir el estado de la compra (70% PAGADO, 30% PENDIENTE_PAGO)
                        const estadoCompra = Math.random() > 0.3 
                            ? EstadoCompra.PAGADO 
                            : EstadoCompra.PENDIENTE_PAGO;

                        // Crear pago solo si la compra está PAGADA
                        let pagoGuardado: pagoEntity | null = null;
                        if (estadoCompra === EstadoCompra.PAGADO) {
                            const metodosPago: Array<'efectivo' | 'transferencia'> = ['efectivo', 'transferencia'];
                            const metodoPago = metodosPago[Math.floor(Math.random() * metodosPago.length)];

                            const pago = this.pagoRepo.create({
                                fecha_pago: fechaCompra,
                                monto_pago: 0, // Se calculará después
                                metodo_pago: metodoPago,
                                sucursal: sucursal,
                            });
                            pagoGuardado = await this.pagoRepo.save(pago);
                        }

                        // Generar detalles de compra (entre 1 y 5 productos por compra)
                        const cantidadDetalles = Math.floor(Math.random() * 5) + 1;
                        const detalles: DetalleCompraEntity[] = [];
                        let montoTotal = 0;

                        // Seleccionar productos aleatorios únicos para esta compra
                        const productosSeleccionados = this.shuffleArray([...productosDelProveedor])
                            .slice(0, Math.min(cantidadDetalles, productosDelProveedor.length));

                        for (const productoProveedor of productosSeleccionados) {
                            // Cantidad a comprar (entre 10 y 100 unidades)
                            const cantidad = Math.floor(Math.random() * 91) + 10;

                            const precioUnitario = Number(productoProveedor.precio_proveedor);
                            const subtotal = cantidad * precioUnitario;
                            montoTotal += subtotal;

                            const detalle = this.detalleCompraRepo.create({
                                producto: productoProveedor,
                                cantidad: cantidad,
                                precio_unitario: precioUnitario,
                                subtotal: subtotal,
                            });

                            detalles.push(detalle);
                        }

                        // Crear la compra con los detalles
                        const compra = this.compraRepo.create({
                            numero_compra: numeroCompraActual,
                            fecha_compra: fechaCompra,
                            monto_total: montoTotal,
                            sucursal: sucursal,
                            contacto: proveedor,
                            estado: estadoCompra,
                            pago: pagoGuardado,
                            detalles: detalles,
                            numero_factura: this.generarNumeroFactura(),
                            observaciones: Math.random() > 0.7 
                                ? `Compra a ${proveedor.nombre_razon_social}` 
                                : null,
                        });

                        const compraGuardada = await this.compraRepo.save(compra);

                        // Actualizar el monto del pago si existe
                        if (pagoGuardado) {
                            pagoGuardado.monto_pago = montoTotal;
                            await this.pagoRepo.save(pagoGuardado);
                        }

                        // GESTIÓN DE STOCK Y MOVIMIENTOS
                        console.log(`      📦 Procesando movimientos de stock para compra #${numeroCompraActual}...`);
                        
                        for (const detalle of detalles) {
                            try {
                                // 1. Obtener el producto ACTUAL de la base de datos
                                const productoParaMovimiento = await this.productoRepo.findOne({
                                    where: { id: detalle.producto.producto_id }
                                });

                                if (!productoParaMovimiento) {
                                    console.log(`         ⚠️  Producto ${detalle.producto.producto_id} no encontrado`);
                                    continue;
                                }

                                // 2. Calcular stock resultante (COMPRA suma stock)
                                const stockResultante = productoParaMovimiento.stock + detalle.cantidad;

                                // 3. Crear movimiento de stock con información precisa
                                const movimiento = this.movimientoStockRepo.create({
                                    fecha: fechaCompra,
                                    tipo_movimiento: TipoMovimientoStock.COMPRA,
                                    descripcion: `Compra #${compra.numero_compra} - ${productoParaMovimiento.nombre} - Proveedor: ${proveedor.nombre_razon_social}`,
                                    cantidad: detalle.cantidad, // Positivo porque es entrada
                                    stock_resultante: stockResultante,
                                    producto_id: productoParaMovimiento.id,
                                    sucursal_id: sucursal.id,
                                });
                                await this.movimientoStockRepo.save(movimiento);

                                // 4. Actualizar el stock del producto en la base de datos
                                productoParaMovimiento.stock = stockResultante;
                                await this.productoRepo.save(productoParaMovimiento);

                                console.log(`         ✅ ${productoParaMovimiento.nombre}: +${detalle.cantidad} unidades → Stock: ${stockResultante}`);

                            } catch (error) {
                                console.log(`         ❌ Error procesando producto ${detalle.producto.producto_id}: ${error.message}`);
                            }
                        }

                        // Actualizar el número de compra en la sucursal
                        sucursal.numero_compra = numeroCompraActual;
                        await this.sucursalRepo.save(sucursal);

                        comprasCreadas++;
                        const estadoTexto = estadoCompra === EstadoCompra.PAGADO ? 'PAGADO' : 'PENDIENTE_PAGO';
                        const pagoInfo = pagoGuardado 
                            ? `, Método pago: ${pagoGuardado.metodo_pago}` 
                            : '';
                        
                        console.log(`      ✅ Compra #${numeroCompraActual} creada: ${detalles.length} productos, Total: $${montoTotal.toFixed(2)}, Estado: ${estadoTexto}, Proveedor: ${proveedor.nombre_razon_social}${pagoInfo}`);

                    } catch (error) {
                        console.log(`      ❌ Error creando compra #${numeroCompraActual}: ${error.message}`);
                    }
                }

                console.log(`      🎯 Total compras creadas para ${sucursal.nombre}: ${comprasCreadas}`);
            }
        }

        console.log('\n✅ Seed de compras completado');
    }

    /**
     * Genera fechas cronológicas (de más antigua a más reciente)
     * @param cantidad Cantidad de fechas a generar
     * @param fechaBase Fecha base (normalmente hoy)
     * @returns Array de fechas en orden cronológico
     */
    private generarFechasCronologicas(cantidad: number, fechaBase: Date): Date[] {
        const fechas: Date[] = [];
        const diasHaciaAtras = 60; // Generar compras de los últimos 60 días
        
        for (let i = 0; i < cantidad; i++) {
            const diasAleatorios = Math.floor(Math.random() * diasHaciaAtras);
            const fecha = new Date(fechaBase);
            fecha.setDate(fecha.getDate() - diasAleatorios);
            
            // Añadir variación de horas
            fecha.setHours(Math.floor(Math.random() * 12) + 8); // Entre 8am y 8pm
            fecha.setMinutes(Math.floor(Math.random() * 60));
            fecha.setSeconds(0);
            fecha.setMilliseconds(0);
            
            fechas.push(fecha);
        }
        
        // Ordenar de más antigua a más reciente
        return fechas.sort((a, b) => a.getTime() - b.getTime());
    }

    /**
     * Mezcla aleatoriamente un array (algoritmo Fisher-Yates)
     */
    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Genera un número de factura aleatorio
     */
    private generarNumeroFactura(): string {
        const puntoVenta = Math.floor(Math.random() * 99) + 1;
        const numero = Math.floor(Math.random() * 99999) + 1;
        return `0001-${puntoVenta.toString().padStart(8, '0')}-${numero.toString().padStart(8, '0')}`;
    }
}
