import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { categoriasEntity } from 'src/database/core/categorias.entity';
import { UnidadMedidaEntity } from 'src/database/core/unidad-medida.entity';

@Injectable()
export class ProductoSimpleSeeder {
    constructor(
        @InjectRepository(ProductoEntity)
        private readonly productoRepo: Repository<ProductoEntity>,
        @InjectRepository(empresaEntity)
        private readonly empresaRepo: Repository<empresaEntity>,
        @InjectRepository(sucursalEntity)
        private readonly sucursalRepo: Repository<sucursalEntity>,
        @InjectRepository(MarcaEntity)
        private readonly marcaRepo: Repository<MarcaEntity>,
        @InjectRepository(categoriasEntity)
        private readonly categoriaRepo: Repository<categoriasEntity>,
        @InjectRepository(UnidadMedidaEntity)
        private readonly unidadRepo: Repository<UnidadMedidaEntity>,
    ) {}

    async run() {
        console.log('📦 Iniciando seed simplificado de productos...');

        // Verificar si ya existen productos
        const existingProductos = await this.productoRepo.count();
        if (existingProductos > 0) {
            console.log('📦 Los productos ya existen, saltando seeder de productos');
            return;
        }

        // === EMPRESAS ===
        const empresaTech = await this.empresaRepo.findOne({ where: { name: 'TechCorp S.A.' } });
        const empresaFood = await this.empresaRepo.findOne({ where: { name: 'FoodMarket Ltda.' } });

        if (!empresaTech || !empresaFood) {
            console.log('❌ No se encontraron las empresas para asignar productos');
            return;
        }

        // Obtener TODAS las sucursales activas de cada empresa
        const sucursalesTech = await this.sucursalRepo.find({ where: { empresa_id: empresaTech.id, estado: true } });
        const sucursalesFood = await this.sucursalRepo.find({ where: { empresa_id: empresaFood.id, estado: true } });

        if (sucursalesTech.length === 0 || sucursalesFood.length === 0) {
            console.log('❌ No se encontraron sucursales activas para las empresas');
            return;
        }

        console.log(`🏢 Sucursales TechCorp: ${sucursalesTech.length}, Sucursales FoodMarket: ${sucursalesFood.length}`);

        // Obtener marcas por empresa
        const marcasTech = await this.marcaRepo.find({ where: { empresa_id: empresaTech.id } });
        const marcasFood = await this.marcaRepo.find({ where: { empresa_id: empresaFood.id } });

        if (marcasTech.length === 0 || marcasFood.length === 0) {
            console.log('❌ No se encontraron marcas para las empresas');
            return;
        }

        // Obtener categorías
        const categoriasTech = await this.categoriaRepo.find({ where: { empresa_id: empresaTech.id } });
        const categoriasFood = await this.categoriaRepo.find({ where: { empresa_id: empresaFood.id } });

        // Obtener unidades de medida por empresa
        const unidadesTech = await this.unidadRepo.find({ where: { empresa_id: empresaTech.id } });
        const unidadesFood = await this.unidadRepo.find({ where: { empresa_id: empresaFood.id } });

        // Encontrar unidades específicas
        const unidadTech = unidadesTech.find(u => u.nombre === 'Unidad') || unidadesTech[0];
        const litroFood = unidadesFood.find(u => u.nombre === 'Litro') || unidadesFood[0];
        const paqueteFood = unidadesFood.find(u => u.nombre === 'Paquete') || unidadesFood[0];
        const kilogramoFood = unidadesFood.find(u => u.nombre === 'Kilogramo') || unidadesFood[0];
        const unidadFood = unidadesFood.find(u => u.nombre === 'Unidad') || unidadesFood[0];

        // Categoría por defecto (primera disponible)
        const categoriaTech = categoriasTech[0];
        const categoriaFood = categoriasFood[0];

        if (!unidadTech || !litroFood || !paqueteFood || !kilogramoFood || !unidadFood) {
            console.log('❌ No se encontraron unidades de medida necesarias');
            return;
        }

        if (!categoriaTech || !categoriaFood) {
            console.log('❌ No se encontraron categorías necesarias');
            return;
        }

        console.log(`✅ Creando productos distribuidos en todas las sucursales...`);

        // PRODUCTOS BASE por tipo de empresa
        const productosBaseTech = [
            {
                nombre: 'iPhone 15 Pro',
                codigo: 'APL-IP15P',
                marca_id: marcasTech.find(m => m.nombre === 'Apple')?.id || marcasTech[0].id,
                categoria_id: categoriaTech.id,
                unidad_medida_id: unidadTech.id,
                precio_costo: 800.00,
                precio_venta: 1200.00,
                stock_apertura: 25,
                stock: 25,
            },
            {
                nombre: 'MacBook Air M2',
                codigo: 'APL-MBA-M2',
                marca_id: marcasTech.find(m => m.nombre === 'Apple')?.id || marcasTech[0].id,
                categoria_id: categoriaTech.id,
                unidad_medida_id: unidadTech.id,
                precio_costo: 1000.00,
                precio_venta: 1500.00,
                stock_apertura: 15,
                stock: 15,
            },
            {
                nombre: 'Samsung Galaxy S24',
                codigo: 'SAM-GS24',
                marca_id: marcasTech.find(m => m.nombre === 'Samsung')?.id || marcasTech[1].id,
                categoria_id: categoriaTech.id,
                unidad_medida_id: unidadTech.id,
                precio_costo: 650.00,
                precio_venta: 950.00,
                stock_apertura: 30,
                stock: 30,
            },
            {
                nombre: 'Samsung Smart TV 55"',
                codigo: 'SAM-TV55',
                marca_id: marcasTech.find(m => m.nombre === 'Samsung')?.id || marcasTech[1].id,
                categoria_id: categoriaTech.id,
                unidad_medida_id: unidadTech.id,
                precio_costo: 400.00,
                precio_venta: 650.00,
                stock_apertura: 20,
                stock: 20,
            },
            {
                nombre: 'Sony PlayStation 5',
                codigo: 'SNY-PS5',
                marca_id: marcasTech.find(m => m.nombre === 'Sony')?.id || marcasTech[2].id,
                categoria_id: categoriaTech.id,
                unidad_medida_id: unidadTech.id,
                precio_costo: 400.00,
                precio_venta: 600.00,
                stock_apertura: 12,
                stock: 12,
            },
        ];

        const productosBaseFood = [
            {
                nombre: 'Coca Cola 2.5L',
                codigo: 'COC-25L',
                marca_id: marcasFood.find(m => m.nombre === 'Coca Cola')?.id || marcasFood[0].id,
                categoria_id: categoriaFood.id,
                unidad_medida_id: litroFood.id,
                precio_costo: 1.20,
                precio_venta: 2.50,
                stock_apertura: 200,
                stock: 200,
            },
            {
                nombre: 'Coca Cola Zero 500ml',
                codigo: 'COC-Z500',
                marca_id: marcasFood.find(m => m.nombre === 'Coca Cola')?.id || marcasFood[0].id,
                categoria_id: categoriaFood.id,
                unidad_medida_id: litroFood.id,
                precio_costo: 0.80,
                precio_venta: 1.50,
                stock_apertura: 150,
                stock: 150,
            },
            {
                nombre: 'Nestlé Leche Condensada',
                codigo: 'NES-LC',
                marca_id: marcasFood.find(m => m.nombre === 'Nestlé')?.id || marcasFood[1].id,
                categoria_id: categoriaFood.id,
                unidad_medida_id: paqueteFood.id,
                precio_costo: 2.00,
                precio_venta: 3.50,
                stock_apertura: 80,
                stock: 80,
            },
            {
                nombre: 'Nestlé Nescafé Original',
                codigo: 'NES-NCF',
                marca_id: marcasFood.find(m => m.nombre === 'Nestlé')?.id || marcasFood[1].id,
                categoria_id: categoriaFood.id,
                unidad_medida_id: paqueteFood.id,
                precio_costo: 4.50,
                precio_venta: 7.00,
                stock_apertura: 60,
                stock: 60,
            },
            {
                nombre: 'Unilever Dove Jabón',
                codigo: 'UNI-DOV',
                marca_id: marcasFood.find(m => m.nombre === 'Unilever')?.id || marcasFood[2].id,
                categoria_id: categoriaFood.id,
                unidad_medida_id: unidadFood.id,
                precio_costo: 1.50,
                precio_venta: 2.80,
                stock_apertura: 120,
                stock: 120,
            },
        ];

        let productosCreados = 0;

        // Crear productos para TODAS las sucursales de TechCorp
        for (const sucursal of sucursalesTech) {
            console.log(`📍 Creando productos para sucursal: ${sucursal.nombre}`);
            
            for (const productoBase of productosBaseTech) {
                try {
                    const productoData = {
                        ...productoBase,
                        codigo: `${productoBase.codigo}-${sucursal.codigo}`,
                        sucursal_id: sucursal.id,
                        estado: true
                    };

                    // Verificar si el producto ya existe por código
                    const existeProducto = await this.productoRepo.findOne({ where: { codigo: productoData.codigo } });
                    if (existeProducto) {
                        console.log(`⚠️ Producto con código ${productoData.codigo} ya existe`);
                        continue;
                    }

                    // Crear el producto
                    const nuevoProducto = this.productoRepo.create(productoData);
                    await this.productoRepo.save(nuevoProducto);
                    productosCreados++;

                    console.log(`   ✅ ${productoData.nombre} (${productoData.codigo}) - Stock: ${productoData.stock}`);

                } catch (error) {
                    console.error(`❌ Error creando producto ${productoBase.nombre}:`, error.message);
                }
            }
        }

        // Crear productos para TODAS las sucursales de FoodMarket
        for (const sucursal of sucursalesFood) {
            console.log(`📍 Creando productos para sucursal: ${sucursal.nombre}`);
            
            for (const productoBase of productosBaseFood) {
                try {
                    const productoData = {
                        ...productoBase,
                        codigo: `${productoBase.codigo}-${sucursal.codigo}`,
                        sucursal_id: sucursal.id,
                        estado: true
                    };

                    // Verificar si el producto ya existe por código
                    const existeProducto = await this.productoRepo.findOne({ where: { codigo: productoData.codigo } });
                    if (existeProducto) {
                        console.log(`⚠️ Producto con código ${productoData.codigo} ya existe`);
                        continue;
                    }

                    // Crear el producto
                    const nuevoProducto = this.productoRepo.create(productoData);
                    await this.productoRepo.save(nuevoProducto);
                    productosCreados++;

                    console.log(`   ✅ ${productoData.nombre} (${productoData.codigo}) - Stock: ${productoData.stock}`);

                } catch (error) {
                    console.error(`❌ Error creando producto ${productoBase.nombre}:`, error.message);
                }
            }
        }

        console.log(`🎉 Seeder de productos completado: ${productosCreados} productos creados en ${sucursalesTech.length + sucursalesFood.length} sucursales`);
    }
}