import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { categoriasEntity } from 'src/database/core/categorias.entity';

@Injectable()
export class CategoriaSimpleSeeder {
    constructor(
        @InjectRepository(categoriasEntity)
        private readonly categoriaRepo: Repository<categoriasEntity>,
        @InjectRepository(empresaEntity)
        private readonly empresaRepo: Repository<empresaEntity>,
    ) {}

    async run() {
        console.log('📂 Iniciando seed simplificado de categorías...');
        
        // Obtener empresas
        const empresaTech = await this.empresaRepo.findOne({ where: { name: 'TechCorp S.A.' } });
        const empresaFood = await this.empresaRepo.findOne({ where: { name: 'FoodMarket Ltda.' } });

        if (!empresaTech || !empresaFood) {
            console.log('❌ No se encontraron las empresas para asignar categorías');
            return;
        }

        console.log(`✅ Asignando categorías a: ${empresaTech.name} (ID: ${empresaTech.id}), ${empresaFood.name} (ID: ${empresaFood.id})`);

        const categoriasConEmpresa = [
            // 🔹 TechCorp S.A. → Tecnología
            { empresaId: empresaTech.id, empresa: empresaTech, nombre: 'Celulares', descripcion: 'Smartphones y accesorios' },
            { empresaId: empresaTech.id, empresa: empresaTech, nombre: 'Televisores', descripcion: 'TV LED, OLED y Smart TV' },
            { empresaId: empresaTech.id, empresa: empresaTech, nombre: 'Computadoras', descripcion: 'PCs, notebooks y accesorios' },
            { empresaId: empresaTech.id, empresa: empresaTech, nombre: 'Periféricos', descripcion: 'Teclados, mouse y accesorios' },
            { empresaId: empresaTech.id, empresa: empresaTech, nombre: 'Audio', descripcion: 'Auriculares, parlantes y micrófonos' },

            // 🔹 FoodMarket Ltda. → Alimentación
            { empresaId: empresaFood.id, empresa: empresaFood, nombre: 'Bebidas', descripcion: 'Refrescos, aguas y jugos' },
            { empresaId: empresaFood.id, empresa: empresaFood, nombre: 'Lácteos', descripcion: 'Leches, yogures y quesos' },
            { empresaId: empresaFood.id, empresa: empresaFood, nombre: 'Snacks', descripcion: 'Galletitas, papas fritas y golosinas' },
            { empresaId: empresaFood.id, empresa: empresaFood, nombre: 'Cereales', descripcion: 'Desayunos y granolas' },
            { empresaId: empresaFood.id, empresa: empresaFood, nombre: 'Congelados', descripcion: 'Verduras, comidas listas y helados' },
        ];

        let categoriasCreadas = 0;
        let categoriasActualizadas = 0;

        for (const categoriaData of categoriasConEmpresa) {
            // Verificar si ya existe
            const categoriaExistente = await this.categoriaRepo.findOne({
                where: { 
                    nombre: categoriaData.nombre, 
                    empresa_id: categoriaData.empresaId 
                },
            });

            if (!categoriaExistente) {
                const nuevaCategoria = this.categoriaRepo.create({
                    nombre: categoriaData.nombre,
                    descripcion: categoriaData.descripcion,
                    empresa_id: categoriaData.empresaId,
                    estado: true,
                });

                await this.categoriaRepo.save(nuevaCategoria);
                categoriasCreadas++;
                console.log(`   ✅ Categoría '${categoriaData.nombre}' creada para ${categoriaData.empresa.name}`);
            } else {
                // Actualizar si existe pero está inactiva o tiene datos diferentes
                if (!categoriaExistente.estado || categoriaExistente.descripcion !== categoriaData.descripcion) {
                    categoriaExistente.descripcion = categoriaData.descripcion;
                    categoriaExistente.estado = true;
                    await this.categoriaRepo.save(categoriaExistente);
                    categoriasActualizadas++;
                    console.log(`   🔄 Categoría '${categoriaData.nombre}' actualizada para ${categoriaData.empresa.name}`);
                } else {
                    console.log(`   ℹ️  Categoría '${categoriaData.nombre}' ya existe para ${categoriaData.empresa.name}`);
                }
            }
        }

        console.log(`\n🎉 Seed de categorías completado:`);
        console.log(`   📝 Categorías nuevas creadas: ${categoriasCreadas}`);
        console.log(`   🔄 Categorías actualizadas: ${categoriasActualizadas}`);
        console.log(`   📊 Total procesadas: ${categoriasConEmpresa.length}`);

        // Mostrar resumen por empresa
        console.log(`\n📋 RESUMEN POR EMPRESA:`);
        console.log(`🏢 ${empresaTech.name}:`);
        const categoriasTech = categoriasConEmpresa.filter(c => c.empresaId === empresaTech.id);
        categoriasTech.forEach(categoria => console.log(`   • ${categoria.nombre} - ${categoria.descripcion}`));
        
        console.log(`🏢 ${empresaFood.name}:`);
        const categoriasFood = categoriasConEmpresa.filter(c => c.empresaId === empresaFood.id);
        categoriasFood.forEach(categoria => console.log(`   • ${categoria.nombre} - ${categoria.descripcion}`));
    }
}
