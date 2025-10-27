import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ventaEntity } from 'src/database/core/venta.entity';
import { detalleVentaEntity } from 'src/database/core/detalleVenta.entity';
import { pagoEntity } from 'src/database/core/pago.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';

@Injectable()
export class VentaSeeder {
    constructor(
        @InjectRepository(ventaEntity)
        private readonly ventaRepo: Repository<ventaEntity>,
        @InjectRepository(detalleVentaEntity)
        private readonly detalleVentaRepo: Repository<detalleVentaEntity>,
        @InjectRepository(pagoEntity)
        private readonly pagoRepo: Repository<pagoEntity>,
        @InjectRepository(ProductoEntity)
        private readonly productoRepo: Repository<ProductoEntity>,
        @InjectRepository(sucursalEntity)
        private readonly sucursalRepo: Repository<sucursalEntity>,
        @InjectRepository(contactoEntity)
        private readonly contactoRepo: Repository<contactoEntity>,
        @InjectRepository(MovimientoStockEntity)
        private readonly movimientoStockRepo: Repository<MovimientoStockEntity>,
    ) {}

    async run() {
        console.log('💰 Iniciando seed de ventas...');
        
        // Verificar si ya existen ventas
        const existingVentas = await this.ventaRepo.count();
        if (existingVentas > 0) {
            console.log('💰 Las ventas ya existen, saltando seeder de ventas');
            return;
        }

        // Obtener sucursales activas
        const sucursales = await this.sucursalRepo.find({ where: { estado: true } });
        if (sucursales.length === 0) {
            console.log('❌ No se encontraron sucursales activas para asignar ventas');
            return;
        }

        // Obtener productos disponibles
        const productos = await this.productoRepo.find({ 
            where: { estado: true },
            relations: ['sucursal']
        });
        
        if (productos.length === 0) {
            console.log('❌ No se encontraron productos para crear ventas');
            return;
        }

        // Obtener contactos (clientes)
        const contactos = await this.contactoRepo.find({
            where: { rol: 'cliente', estado: true },
            take: 10
        });

        console.log(`✅ Creando ventas con múltiples detalles...`);
        console.log(`   Sucursales disponibles: ${sucursales.length}`);
        console.log(`   Productos disponibles: ${productos.length}`);
        console.log(`   Contactos disponibles: ${contactos.length}`);

        // Contador de ventas por sucursal (para numero_venta secuencial)
        const contadoresVentaPorSucursal = new Map<number, number>();
        sucursales.forEach(s => contadoresVentaPorSucursal.set(s.id, 0));

        // Fechas base para las ventas (últimos 3 meses)
        const fechaBase = new Date();
        
        // Crear diferentes cantidades de ventas por sucursal (mínimo 10, máximo 20)
        const ventasPorSucursal = this.generarDistribucionVentas(sucursales.length);
        
        for (let i = 0; i < sucursales.length; i++) {
            const sucursal = sucursales[i];
            const cantidadVentas = ventasPorSucursal[i];
            
            console.log(`\n   📍 Creando ${cantidadVentas} ventas para: ${sucursal.nombre}`);
            
            // Filtrar productos de la sucursal actual
            const productosSucursal = productos.filter(p => p.sucursal_id === sucursal.id);
            
            if (productosSucursal.length === 0) {
                console.log(`      ⚠️  No hay productos para esta sucursal, saltando ventas`);
                continue;
            }

            let ventasCreadas = 0;
            let intentos = 0;
            const maxIntentos = cantidadVentas * 2; // Máximo de intentos para evitar loop infinito

            while (ventasCreadas < cantidadVentas && intentos < maxIntentos) {
                try {
                    intentos++;
                    
                    // Incrementar contador de ventas para esta sucursal
                    const numeroVentaActual = contadoresVentaPorSucursal.get(sucursal.id) + 1;
                    contadoresVentaPorSucursal.set(sucursal.id, numeroVentaActual);

                    // Seleccionar contacto aleatorio (puede ser null para consumidor final)
                    const contacto = contactos.length > 0 && Math.random() > 0.3 
                        ? contactos[Math.floor(Math.random() * contactos.length)]
                        : null;

                    // Generar fecha de venta (últimos 90 días)
                    const diasAtras = Math.floor(Math.random() * 90);
                    const fechaVenta = new Date(fechaBase);
                    fechaVenta.setDate(fechaVenta.getDate() - diasAtras);
                    fechaVenta.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0);

                    // Seleccionar método de pago aleatorio
                    const metodosPago: Array<'efectivo' | 'transferencia'> = ['efectivo', 'transferencia'];
                    const metodoPago: 'efectivo' | 'transferencia' = metodosPago[Math.floor(Math.random() * metodosPago.length)];

                    // Crear el pago primero
                    const pago = this.pagoRepo.create({
                        fecha_pago: fechaVenta,
                        monto_pago: 0, // Se calculará después
                        metodo_pago: metodoPago,
                        sucursal: sucursal,
                    });
                    const pagoGuardado = await this.pagoRepo.save(pago);

                    // Generar detalles de venta (entre 1 y 8 productos por venta)
                    const cantidadDetalles = Math.floor(Math.random() * 8) + 1;
                    const detalles: detalleVentaEntity[] = [];
                    let montoTotal = 0;

                    // Seleccionar productos aleatorios únicos para esta venta
                    const productosSeleccionados = this.shuffleArray([...productosSucursal])
                        .slice(0, Math.min(cantidadDetalles, productosSucursal.length));

                    for (const producto of productosSeleccionados) {
                        // Verificar que hay stock suficiente
                        const stockDisponible = Math.max(0, producto.stock);
                        const cantidad = stockDisponible > 0 
                            ? Math.min(
                                Math.floor(Math.random() * 5) + 1, // Intentar vender 1 a 5 unidades
                                stockDisponible // Pero no más del stock disponible
                              )
                            : 0;
                        
                        if (cantidad === 0) {
                            continue;
                        }

                        const precioUnitario = Number(producto.precio_venta);
                        const subtotal = cantidad * precioUnitario;
                        montoTotal += subtotal;

                        const detalle = this.detalleVentaRepo.create({
                            producto: producto,
                            cantidad: cantidad,
                            precio_unitario: precioUnitario,
                            subtotal: subtotal,
                        });

                        detalles.push(detalle);
                        
                        // Reducir el stock del producto
                        producto.stock -= cantidad;
                    }

                    // Si no hay detalles (por falta de stock), saltar esta venta
                    if (detalles.length === 0) {
                        console.log(`      ⚠️  Venta #${numeroVentaActual} saltada - no hay productos con stock`);
                        await this.pagoRepo.remove(pagoGuardado);
                        contadoresVentaPorSucursal.set(sucursal.id, numeroVentaActual - 1);
                        continue;
                    }

                    // Crear la venta con los detalles
                    const venta = this.ventaRepo.create({
                        numero_venta: numeroVentaActual,
                        fecha_venta: fechaVenta,
                        monto_total: montoTotal,
                        sucursal: sucursal,
                        contacto: contacto,
                        pago: pagoGuardado,
                        detalles: detalles,
                    });

                    const ventaGuardada = await this.ventaRepo.save(venta);

                    // Actualizar el monto del pago
                    pagoGuardado.monto_pago = montoTotal;
                    await this.pagoRepo.save(pagoGuardado);

                    // Guardar cambios de stock en productos y crear movimientos de stock
                    for (const detalle of detalles) {
                        // Guardar el producto con stock reducido
                        await this.productoRepo.save(detalle.producto);
                        
                        // Crear movimiento de stock tipo VENTA (solo registro histórico)
                        const movimiento = this.movimientoStockRepo.create({
                            fecha: fechaVenta,
                            tipo_movimiento: TipoMovimientoStock.VENTA,
                            descripcion: `Venta #${venta.numero_venta} - Producto vendido (seeder)`,
                            cantidad: -detalle.cantidad, // Negativo porque es salida
                            stock_resultante: detalle.producto.stock, // Stock después de la venta
                            producto_id: detalle.producto.id,
                            sucursal_id: sucursal.id,
                        });
                        await this.movimientoStockRepo.save(movimiento);
                    }

                    // Actualizar el número de venta en la sucursal
                    sucursal.numero_venta = numeroVentaActual;
                    await this.sucursalRepo.save(sucursal);

                    ventasCreadas++;
                    console.log(`      ✅ Venta #${numeroVentaActual} creada: ${detalles.length} productos, Total: $${montoTotal.toFixed(2)}, Pago: ${metodoPago}`);

                } catch (error) {
                    console.log(`      ❌ Error creando venta: ${error.message}`);
                }
            }

            if (ventasCreadas < cantidadVentas) {
                console.log(`      ⚠️  Solo se pudieron crear ${ventasCreadas} de ${cantidadVentas} ventas planeadas`);
            }
        }

        console.log('\n🎉 Seed de ventas completado');
        console.log('📊 Resumen por sucursal:');
        let totalVentas = 0;
        for (const sucursal of sucursales) {
            const ventasSucursal = contadoresVentaPorSucursal.get(sucursal.id);
            totalVentas += ventasSucursal;
            console.log(`   ${sucursal.nombre}: ${ventasSucursal} ventas creadas`);
        }
        console.log(`   TOTAL: ${totalVentas} ventas creadas en el sistema`);
    }

    // Generar distribución diferente de ventas por sucursal (mínimo 10, máximo 20)
    private generarDistribucionVentas(cantidadSucursales: number): number[] {
        const distribucion: number[] = [];
        
        // Asignar diferentes cantidades para cada sucursal
        for (let i = 0; i < cantidadSucursales; i++) {
            // Primera sucursal: más ventas (15-20)
            if (i === 0) {
                distribucion.push(Math.floor(Math.random() * 6) + 15); // 15-20
            }
            // Segunda sucursal: cantidad media (12-17)
            else if (i === 1) {
                distribucion.push(Math.floor(Math.random() * 6) + 12); // 12-17
            }
            // Tercera sucursal: cantidad media-baja (10-15)
            else if (i === 2) {
                distribucion.push(Math.floor(Math.random() * 6) + 10); // 10-15
            }
            // Resto: mínimo 10
            else {
                distribucion.push(Math.floor(Math.random() * 6) + 10); // 10-15
            }
        }
        
        return distribucion;
    }

    // Función auxiliar para mezclar un array (shuffle)
    private shuffleArray<T>(array: T[]): T[] {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
}