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

        // Obtener sucursales
        const sucursales = await this.sucursalRepo.find();
        if (sucursales.length === 0) {
            console.log('❌ No se encontraron sucursales para asignar ventas');
            return;
        }

        // Obtener productos disponibles
        const productos = await this.productoRepo.find({ 
            where: { estado: true },
            take: 50 // Limitar a los primeros 50 productos
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

        console.log(`✅ Creando 20 ventas con múltiples detalles...`);
        console.log(`   Sucursales disponibles: ${sucursales.length}`);
        console.log(`   Productos disponibles: ${productos.length}`);
        console.log(`   Contactos disponibles: ${contactos.length}`);

        // Fechas base para las ventas (últimos 3 meses)
        const fechaBase = new Date();
        
        for (let i = 1; i <= 20; i++) {
            try {
                // Seleccionar sucursal aleatoria
                const sucursal = sucursales[Math.floor(Math.random() * sucursales.length)];
                
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
                const metodoPago = Math.random() > 0.5 ? 'efectivo' : 'transferencia';

                // Crear el pago primero
                const pago = this.pagoRepo.create({
                    fecha_pago: fechaVenta,
                    monto_pago: 0, // Se calculará después
                    metodo_pago: metodoPago,
                    sucursal: sucursal,
                });
                const pagoGuardado = await this.pagoRepo.save(pago);

                // Generar detalles de venta (entre 2 y 6 productos por venta)
                const cantidadDetalles = Math.floor(Math.random() * 5) + 2;
                const detalles: detalleVentaEntity[] = [];
                let montoTotal = 0;

                // Seleccionar productos aleatorios únicos para esta venta
                const productosSeleccionados = this.shuffleArray([...productos])
                    .slice(0, cantidadDetalles);

                for (const producto of productosSeleccionados) {
                    // Verificar que hay stock suficiente
                    const cantidad = Math.min(
                        Math.floor(Math.random() * 5) + 1, // Intentar vender 1 a 5 unidades
                        producto.stock // Pero no más del stock disponible
                    );
                    
                    if (cantidad === 0) {
                        console.log(`   ⚠️ Saltando producto "${producto.nombre}" - sin stock`);
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
                    console.log(`   ⚠️ Venta #${1000 + i} saltada - no hay productos con stock`);
                    await this.pagoRepo.remove(pagoGuardado);
                    continue;
                }

                // Crear la venta con los detalles
                const venta = this.ventaRepo.create({
                    numero_venta: 1000 + i,
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
                sucursal.numero_venta = venta.numero_venta;
                await this.sucursalRepo.save(sucursal);

                console.log(`   ✅ Venta #${venta.numero_venta} creada: ${detalles.length} productos, Total: $${montoTotal.toFixed(2)}, Pago: ${metodoPago}`);

            } catch (error) {
                console.error(`   ❌ Error creando venta #${i}:`, error.message);
            }
        }

        console.log('✅ Seed de ventas completado');
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
