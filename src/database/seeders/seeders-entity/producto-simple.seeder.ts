import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';
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

        // === MARCAS ===
        const marcasTech = await this.marcaRepo.find({ where: { empresa_id: empresaTech.id } });
        const marcasFood = await this.marcaRepo.find({ where: { empresa_id: empresaFood.id } });

        if (marcasTech.length === 0 || marcasFood.length === 0) {
            console.log('❌ No se encontraron marcas para las empresas');
            return;
        }

        // === CATEGORÍAS ===
        const categorias = await this.categoriaRepo.find();
        const categoriaTecnologia = categorias.find(c => c.nombre === 'Celulares');
        const categoriaAlimentos = categorias.find(c => c.nombre === 'Bebidas');

        if (!categoriaTecnologia || !categoriaAlimentos) {
            console.log('❌ No se encontraron las categorías necesarias (Celulares, Bebidas)');
            return;
        }

        // === UNIDADES DE MEDIDA ===
        const unidad = await this.unidadRepo.findOne({ where: { nombre: 'Unidad', empresa_id: empresaTech.id } });
        const paquete = await this.unidadRepo.findOne({ where: { nombre: 'Paquete', empresa_id: empresaFood.id } });
        const litro = await this.unidadRepo.findOne({ where: { nombre: 'Litro', empresa_id: empresaFood.id } });
        const kilogramo = await this.unidadRepo.findOne({ where: { nombre: 'Kilogramo', empresa_id: empresaFood.id } });

        if (!unidad || !paquete || !litro || !kilogramo) {
            console.log('⚠️ No se encontraron todas las unidades de medida, ejecutá primero el seeder de unidades');
            return;
        }

        console.log(`✅ Creando productos para: ${empresaTech.name} y ${empresaFood.name}`);

        const productosData = [
            // === PRODUCTOS TECNOLÓGICOS (TechCorp S.A.) ===
            {
                nombre: 'iPhone 15 Pro',
                codigo: 'APL-IP15P-001',
                empresa_id: empresaTech.id,
                marca_id: marcasTech.find(m => m.nombre === 'Apple')?.id || marcasTech[0].id,
                categoria_id: categoriaTecnologia.id,
                unidad_medida_id: unidad.id,
                precio_costo: 800.00,
                precio_venta: 1200.00,
                stock_apertura: 25,
                stock: 25,
                estado: true
            },
            {
                nombre: 'MacBook Air M2',
                codigo: 'APL-MBA-M2-001',
                empresa_id: empresaTech.id,
                marca_id: marcasTech.find(m => m.nombre === 'Apple')?.id || marcasTech[0].id,
                categoria_id: categoriaTecnologia.id,
                unidad_medida_id: unidad.id,
                precio_costo: 1000.00,
                precio_venta: 1500.00,
                stock_apertura: 15,
                stock: 15,
                estado: true
            },
            {
                nombre: 'Samsung Galaxy S24',
                codigo: 'SAM-GS24-001',
                empresa_id: empresaTech.id,
                marca_id: marcasTech.find(m => m.nombre === 'Samsung')?.id || marcasTech[1].id,
                categoria_id: categoriaTecnologia.id,
                unidad_medida_id: unidad.id,
                precio_costo: 650.00,
                precio_venta: 950.00,
                stock_apertura: 30,
                stock: 30,
                estado: true
            },
            {
                nombre: 'Samsung Smart TV 55"',
                codigo: 'SAM-TV55-001',
                empresa_id: empresaTech.id,
                marca_id: marcasTech.find(m => m.nombre === 'Samsung')?.id || marcasTech[1].id,
                categoria_id: categoriaTecnologia.id,
                unidad_medida_id: unidad.id,
                precio_costo: 400.00,
                precio_venta: 650.00,
                stock_apertura: 20,
                stock: 20,
                estado: true
            },
            {
                nombre: 'Sony PlayStation 5',
                codigo: 'SNY-PS5-001',
                empresa_id: empresaTech.id,
                marca_id: marcasTech.find(m => m.nombre === 'Sony')?.id || marcasTech[2].id,
                categoria_id: categoriaTecnologia.id,
                unidad_medida_id: unidad.id,
                precio_costo: 400.00,
                precio_venta: 600.00,
                stock_apertura: 12,
                stock: 12,
                estado: true
            },
            {
                nombre: 'Sony WH-1000XM5 Auriculares',
                codigo: 'SNY-WH1000-001',
                empresa_id: empresaTech.id,
                marca_id: marcasTech.find(m => m.nombre === 'Sony')?.id || marcasTech[2].id,
                categoria_id: categoriaTecnologia.id,
                unidad_medida_id: unidad.id,
                precio_costo: 200.00,
                precio_venta: 320.00,
                stock_apertura: 40,
                stock: 40,
                estado: true
            },
            {
                nombre: 'LG OLED 65" 4K',
                codigo: 'LG-OLED65-001',
                empresa_id: empresaTech.id,
                marca_id: marcasTech.find(m => m.nombre === 'LG')?.id || marcasTech[3].id,
                categoria_id: categoriaTecnologia.id,
                unidad_medida_id: unidad.id,
                precio_costo: 1200.00,
                precio_venta: 1800.00,
                stock_apertura: 8,
                stock: 8,
                estado: true
            },
            {
                nombre: 'HP Pavilion Laptop',
                codigo: 'HP-PAV-001',
                empresa_id: empresaTech.id,
                marca_id: marcasTech.find(m => m.nombre === 'HP')?.id || marcasTech[4].id,
                categoria_id: categoriaTecnologia.id,
                unidad_medida_id: unidad.id,
                precio_costo: 500.00,
                precio_venta: 750.00,
                stock_apertura: 18,
                stock: 18,
                estado: true
            },

            // === PRODUCTOS ALIMENTICIOS (FoodMarket Ltda.) ===
            {
                nombre: 'Coca Cola 2.5L',
                codigo: 'COC-25L-001',
                empresa_id: empresaFood.id,
                marca_id: marcasFood.find(m => m.nombre === 'Coca Cola')?.id || marcasFood[0].id,
                categoria_id: categoriaAlimentos.id,
                unidad_medida_id: litro.id,
                precio_costo: 1.20,
                precio_venta: 2.50,
                stock_apertura: 200,
                stock: 200,
                estado: true
            },
            {
                nombre: 'Coca Cola Zero 500ml',
                codigo: 'COC-Z500-001',
                empresa_id: empresaFood.id,
                marca_id: marcasFood.find(m => m.nombre === 'Coca Cola')?.id || marcasFood[0].id,
                categoria_id: categoriaAlimentos.id,
                unidad_medida_id: litro.id,
                precio_costo: 0.80,
                precio_venta: 1.50,
                stock_apertura: 150,
                stock: 150,
                estado: true
            },
            {
                nombre: 'Nestlé Leche Condensada',
                codigo: 'NES-LC-001',
                empresa_id: empresaFood.id,
                marca_id: marcasFood.find(m => m.nombre === 'Nestlé')?.id || marcasFood[1].id,
                categoria_id: categoriaAlimentos.id,
                unidad_medida_id: paquete.id,
                precio_costo: 2.00,
                precio_venta: 3.50,
                stock_apertura: 80,
                stock: 80,
                estado: true
            },
            {
                nombre: 'Nestlé Nescafé Original',
                codigo: 'NES-NCF-001',
                empresa_id: empresaFood.id,
                marca_id: marcasFood.find(m => m.nombre === 'Nestlé')?.id || marcasFood[1].id,
                categoria_id: categoriaAlimentos.id,
                unidad_medida_id: paquete.id,
                precio_costo: 4.50,
                precio_venta: 7.00,
                stock_apertura: 60,
                stock: 60,
                estado: true
            },
            {
                nombre: 'Unilever Dove Jabón',
                codigo: 'UNI-DOV-001',
                empresa_id: empresaFood.id,
                marca_id: marcasFood.find(m => m.nombre === 'Unilever')?.id || marcasFood[2].id,
                categoria_id: categoriaAlimentos.id,
                unidad_medida_id: unidad.id,
                precio_costo: 1.50,
                precio_venta: 2.80,
                stock_apertura: 120,
                stock: 120,
                estado: true
            },
            {
                nombre: 'Danone Yogurt Natural',
                codigo: 'DAN-YOG-001',
                empresa_id: empresaFood.id,
                marca_id: marcasFood.find(m => m.nombre === 'Danone')?.id || marcasFood[3].id,
                categoria_id: categoriaAlimentos.id,
                unidad_medida_id: kilogramo.id,
                precio_costo: 0.90,
                precio_venta: 1.80,
                stock_apertura: 100,
                stock: 100,
                estado: true
            },
            {
                nombre: 'Kelloggs Corn Flakes',
                codigo: 'KEL-CF-001',
                empresa_id: empresaFood.id,
                marca_id: marcasFood.find(m => m.nombre === 'Kelloggs')?.id || marcasFood[4].id,
                categoria_id: categoriaAlimentos.id,
                unidad_medida_id: paquete.id,
                precio_costo: 3.00,
                precio_venta: 5.50,
                stock_apertura: 45,
                stock: 45,
                estado: true
            },
        ];

        let productosCreados = 0;

        for (const productoData of productosData) {
            try {
                // Verificar que la marca existe
                const marca = await this.marcaRepo.findOne({ where: { id: productoData.marca_id } });
                if (!marca) {
                    console.log(`⚠️ Marca con ID ${productoData.marca_id} no encontrada para producto ${productoData.nombre}`);
                    continue;
                }

                // Verificar que la categoría existe
                const categoria = await this.categoriaRepo.findOne({ where: { id: productoData.categoria_id } });
                if (!categoria) {
                    console.log(`⚠️ Categoría con ID ${productoData.categoria_id} no encontrada para producto ${productoData.nombre}`);
                    continue;
                }

                // Verificar que la unidad de medida existe
                const unidadMedida = await this.unidadRepo.findOne({ where: { id: productoData.unidad_medida_id } });
                if (!unidadMedida) {
                    console.log(`⚠️ Unidad de medida con ID ${productoData.unidad_medida_id} no encontrada para producto ${productoData.nombre}`);
                    continue;
                }

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

                console.log(`✅ Producto creado: ${productoData.nombre} (${productoData.codigo}) - Empresa: ${productoData.empresa_id} - Categoria: ${productoData.categoria_id} - Unidad: ${productoData.unidad_medida_id}`);

            } catch (error) {
                console.error(`❌ Error creando producto ${productoData.nombre}:`, error.message);
            }
        }

        console.log(`🎉 Seeder de productos completado: ${productosCreados} productos creados`);
    }
}