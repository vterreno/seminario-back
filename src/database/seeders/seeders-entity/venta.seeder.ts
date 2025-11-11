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

        // Fecha base para las ventas (hoy)
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

            // 🔄 CAMBIO CLAVE: Generar TODAS las fechas primero en orden cronológico
            const fechasVentas = this.generarFechasCronologicas(cantidadVentas, fechaBase);
            
            let ventasCreadas = 0;
            let intentos = 0;
            const maxIntentos = cantidadVentas * 2;

            // 🔄 CAMBIO CLAVE: Iterar por número de venta (1, 2, 3...) con fechas pre-asignadas
            for (let numeroVentaActual = 1; numeroVentaActual <= cantidadVentas && intentos < maxIntentos; numeroVentaActual++) {
                try {
                    intentos++;
                    
                    // Usar la fecha pre-generada para esta venta (en orden cronológico)
                    const fechaVenta = fechasVentas[numeroVentaActual - 1];

                    // Seleccionar contacto aleatorio (puede ser null para consumidor final)
                    const contacto = contactos.length > 0 && Math.random() > 0.3 
                        ? contactos[Math.floor(Math.random() * contactos.length)]
                        : null;

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
                        // OBTENER STOCK ACTUAL desde la base de datos para cálculo preciso
                        const productoActual = await this.productoRepo.findOne({
                            where: { id: producto.id }
                        });

                        if (!productoActual) continue;

                        // Verificar que hay stock suficiente usando datos actuales
                        const stockDisponible = Math.max(0, productoActual.stock);
                        const cantidad = stockDisponible > 0 
                            ? Math.min(
                                Math.floor(Math.random() * 5) + 1, // Intentar vender 1 a 5 unidades
                                stockDisponible // Pero no más del stock disponible
                              )
                            : 0;
                        
                        if (cantidad === 0) {
                            continue;
                        }

                        const precioUnitario = Number(productoActual.precio_venta);
                        const subtotal = cantidad * precioUnitario;
                        montoTotal += subtotal;

                        const detalle = this.detalleVentaRepo.create({
                            producto: productoActual,
                            cantidad: cantidad,
                            precio_unitario: precioUnitario,
                            subtotal: subtotal,
                        });

                        detalles.push(detalle);
                    }

                    // Si no hay detalles (por falta de stock), saltar esta venta
                    if (detalles.length === 0) {
                        console.log(`      ⚠️  Venta #${numeroVentaActual} saltada - no hay productos con stock`);
                        await this.pagoRepo.remove(pagoGuardado);
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

                    // GESTIÓN DE STOCK Y MOVIMIENTOS
                    console.log(`      📦 Procesando movimientos de stock...`);
                    
                    for (const detalle of detalles) {
                        try {
                            // 1. Obtener el producto ACTUAL de la base de datos
                            const productoParaMovimiento = await this.productoRepo.findOne({
                                where: { id: detalle.producto.id }
                            });

                            if (!productoParaMovimiento) {
                                console.log(`         ⚠️  Producto ${detalle.producto.id} no encontrado para movimiento`);
                                continue;
                            }

                            // 2. Calcular stock resultante CORRECTO
                            const stockResultante = productoParaMovimiento.stock - detalle.cantidad;

                            // 3. Crear movimiento de stock con información precisa
                            const movimiento = this.movimientoStockRepo.create({
                                fecha: fechaVenta,
                                tipo_movimiento: TipoMovimientoStock.VENTA,
                                descripcion: `Venta #${venta.numero_venta} - ${productoParaMovimiento.nombre}`,
                                cantidad: -detalle.cantidad, // Negativo porque es salida
                                stock_resultante: stockResultante,
                                producto_id: productoParaMovimiento.id,
                                sucursal_id: sucursal.id,
                            });
                            await this.movimientoStockRepo.save(movimiento);

                            // 4. Actualizar el stock del producto en la base de datos
                            productoParaMovimiento.stock = stockResultante;
                            await this.productoRepo.save(productoParaMovimiento);

                            console.log(`         ✅ ${productoParaMovimiento.nombre}: -${detalle.cantidad} unidades → Stock: ${stockResultante}`);

                        } catch (error) {
                            console.log(`         ❌ Error procesando producto ${detalle.producto.id}: ${error.message}`);
                        }
                    }

                    // Actualizar el número de venta en la sucursal
                    sucursal.numero_venta = numeroVentaActual;
                    await this.sucursalRepo.save(sucursal);

                    ventasCreadas++;
                    console.log(`      ✅ Venta #${numeroVentaActual} creada: ${detalles.length} productos, Total: $${montoTotal.toFixed(2)}, Fecha: ${fechaVenta.toLocaleDateString()}, Pago: ${metodoPago}`);

                } catch (error) {
                    console.log(`      ❌ Error creando venta #${numeroVentaActual}: ${error.message}`);
                    // Si hay error, continuar con la siguiente venta pero mantener el orden
                }
            }

            if (ventasCreadas < cantidadVentas) {
                console.log(`      ⚠️  Solo se pudieron crear ${ventasCreadas} de ${cantidadVentas} ventas planeadas`);
            }
        }

        console.log('\n🎉 Seed de ventas completado');
    }

    // 🔄 NUEVO MÉTODO: Generar fechas en orden cronológico
    private generarFechasCronologicas(cantidadVentas: number, fechaBase: Date): Date[] {
        const fechas: Date[] = [];
        
        // Generar fechas distribuidas en los últimos 90 días
        for (let i = 0; i < cantidadVentas; i++) {
            // Distribuir las fechas de manera más realista
            // Las ventas más recientes (números más altos) tendrán fechas más recientes
            const progresion = i / cantidadVentas; // 0 a 1
            const diasAtras = Math.floor((1 - progresion) * 90); // Más recientes para números más altos
            
            const fechaVenta = new Date(fechaBase);
            fechaVenta.setDate(fechaVenta.getDate() - diasAtras);
            
            // Agregar variación de horas dentro del mismo día
            const hora = Math.floor(Math.random() * 12) + 8; // Entre 8 AM y 7 PM
            const minuto = Math.floor(Math.random() * 60);
            fechaVenta.setHours(hora, minuto, 0, 0);
            
            fechas.push(fechaVenta);
        }
        
        // Ordenar las fechas de más antigua a más reciente
        fechas.sort((a, b) => a.getTime() - b.getTime());
        
        console.log(`      📅 Fechas generadas: ${fechas[0]?.toLocaleDateString()} a ${fechas[fechas.length-1]?.toLocaleDateString()}`);
        
        return fechas;
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