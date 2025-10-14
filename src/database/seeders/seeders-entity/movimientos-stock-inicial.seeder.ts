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

        for (const producto of productos) {
            // Solo crear movimiento si el producto tiene stock inicial y sucursal
            if (producto.stock_apertura && producto.stock_apertura > 0 && producto.sucursal?.id) {
                const movimiento = {
                    fecha: new Date(),
                    tipo_movimiento: TipoMovimientoStock.STOCK_APERTURA,
                    descripcion: 'Stock de apertura al crear producto',
                    cantidad: producto.stock_apertura,
                    stock_resultante: producto.stock_apertura,
                    producto_id: producto.id,
                    sucursal_id: producto.sucursal.id
                };
                movimientos.push(movimiento);
            }
        }

        if (movimientos.length > 0) {
            await this.movimientoStockRepo.save(movimientos);
            console.log(`✅ Creados ${movimientos.length} movimientos de stock iniciales`);
        } else {
            console.log('ℹ️ No se crearon movimientos porque no hay productos con stock inicial');
        }
    }
}
