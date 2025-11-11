import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';

@Injectable()
export class MovimientosStockInicialSeeder {
    constructor(
        @InjectRepository(ProductoEntity)
        private readonly productoRepo: Repository<ProductoEntity>,
        @InjectRepository(MovimientoStockEntity)
        private readonly movimientoStockRepo: Repository<MovimientoStockEntity>,
    ) {}

    async run() {
        console.log('📦 Iniciando seed de movimientos de stock iniciales...');
        
        // Verificar si ya existen movimientos de stock
        const existingMovimientos = await this.movimientoStockRepo.count();
        if (existingMovimientos > 0) {
            console.log('📦 Los movimientos de stock ya existen, saltando seeder');
            return;
        }

        // Obtener todos los productos con su sucursal para acceder a empresa_id
        const productos = await this.productoRepo.find({
            relations: ['sucursal', 'sucursal.empresa']
        });

        if (productos.length === 0) {
            console.log('⚠️ No hay productos para crear movimientos de stock iniciales');
            return;
        }

        console.log(`📦 Creando movimientos de stock iniciales para ${productos.length} productos...`);

        const movimientos: Partial<MovimientoStockEntity>[] = [];

        // Fecha base: 1 de julio del año actual
        const fechaJulio = new Date();
        fechaJulio.setMonth(6); // Julio (0 = Enero, 6 = Julio)
        fechaJulio.setDate(1);  // Primer día del mes
        fechaJulio.setHours(8, 0, 0, 0); // 8:00 AM

        console.log(`   📅 Fecha de stock de apertura: ${fechaJulio.toLocaleDateString()}`);

        for (const producto of productos) {
            // 🔄 CAMBIO: Siempre establecer stock mínimo de 100
            const stockApertura = Math.max(100, producto.stock_apertura || 0);
            
            // Actualizar el stock actual del producto al stock de apertura
            producto.stock = stockApertura;
            
            // Solo crear movimiento si el producto tiene sucursal
            if (producto.sucursal?.id) {
                const movimiento = {
                    fecha: fechaJulio,
                    tipo_movimiento: TipoMovimientoStock.STOCK_APERTURA,
                    descripcion: 'Stock de apertura',
                    cantidad: stockApertura,
                    stock_resultante: stockApertura,
                    producto_id: producto.id,
                    sucursal_id: producto.sucursal.id
                };
                movimientos.push(movimiento);
                
                console.log(`      ✅ ${producto.nombre}: Stock apertura = ${stockApertura} unidades`);
            } else {
                console.log(`      ⚠️  ${producto.nombre}: Sin sucursal asignada, saltando movimiento`);
            }
        }

        if (movimientos.length > 0) {
            // Primero actualizar los stocks de los productos
            await this.productoRepo.save(productos);
            console.log(`   🔄 Stocks actualizados en productos`);
            
            // Luego crear los movimientos de stock
            await this.movimientoStockRepo.save(movimientos);
            console.log(`✅ Creados ${movimientos.length} movimientos de stock iniciales`);
            console.log(`📊 Stock mínimo garantizado: 100 unidades por producto`);
            console.log(`📅 Fecha de apertura: Julio ${fechaJulio.getFullYear()}`);
        } else {
            console.log('ℹ️ No se crearon movimientos porque no hay productos con sucursal asignada');
        }
    }
}