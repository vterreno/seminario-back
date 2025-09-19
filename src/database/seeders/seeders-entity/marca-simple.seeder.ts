import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';

@Injectable()
export class MarcaSimpleSeeder {
    constructor(
        @InjectRepository(MarcaEntity)
        private readonly marcaRepo: Repository<MarcaEntity>,
        @InjectRepository(empresaEntity)
        private readonly empresaRepo: Repository<empresaEntity>,
    ) {}

    async run() {
        console.log('🏷️ Iniciando seed simplificado de marcas...');
        
        // Obtener empresas
        const empresaTech = await this.empresaRepo.findOne({ where: { name: 'TechCorp S.A.' } });
        const empresaFood = await this.empresaRepo.findOne({ where: { name: 'FoodMarket Ltda.' } });

        if (!empresaTech || !empresaFood) {
            console.log('❌ No se encontraron las empresas para asignar marcas');
            return;
        }

        console.log(`✅ Asignando marcas a: ${empresaTech.name} (ID: ${empresaTech.id}), ${empresaFood.name} (ID: ${empresaFood.id})`);

        const marcasConEmpresa = [
            // 🔹 TechCorp S.A. → Tecnología
            { empresaId: empresaTech.id, empresa: empresaTech, nombre: 'Apple', descripcion: 'Dispositivos tecnológicos premium' },
            { empresaId: empresaTech.id, empresa: empresaTech, nombre: 'Samsung', descripcion: 'Electrónica y smartphones' },
            { empresaId: empresaTech.id, empresa: empresaTech, nombre: 'Sony', descripcion: 'Electrónica de consumo' },
            { empresaId: empresaTech.id, empresa: empresaTech, nombre: 'LG', descripcion: 'Electrodomésticos y electrónica' },
            { empresaId: empresaTech.id, empresa: empresaTech, nombre: 'HP', descripcion: 'Computadoras y equipos de oficina' },

            // 🔹 FoodMarket Ltda. → Alimentación
            { empresaId: empresaFood.id, empresa: empresaFood, nombre: 'Coca Cola', descripcion: 'Bebidas refrescantes' },
            { empresaId: empresaFood.id, empresa: empresaFood, nombre: 'Nestlé', descripcion: 'Productos alimenticios' },
            { empresaId: empresaFood.id, empresa: empresaFood, nombre: 'Unilever', descripcion: 'Productos de consumo' },
            { empresaId: empresaFood.id, empresa: empresaFood, nombre: 'Danone', descripcion: 'Lácteos y productos saludables' },
            { empresaId: empresaFood.id, empresa: empresaFood, nombre: 'Kelloggs', descripcion: 'Cereales y snacks' },
        ];

        let marcasCreadas = 0;
        let marcasActualizadas = 0;

        for (const marcaData of marcasConEmpresa) {
            // Verificar si ya existe
            const marcaExistente = await this.marcaRepo.findOne({
                where: { 
                    nombre: marcaData.nombre, 
                    empresa_id: marcaData.empresaId 
                },
            });

            if (!marcaExistente) {
                const nuevaMarca = this.marcaRepo.create({
                    nombre: marcaData.nombre,
                    descripcion: marcaData.descripcion,
                    empresa_id: marcaData.empresaId,
                    estado: true,
                });

                await this.marcaRepo.save(nuevaMarca);
                marcasCreadas++;
                console.log(`   ✅ Marca '${marcaData.nombre}' creada para ${marcaData.empresa.name}`);
            } else {
                // Actualizar si existe pero está inactiva o tiene datos diferentes
                if (!marcaExistente.estado || marcaExistente.descripcion !== marcaData.descripcion) {
                    marcaExistente.descripcion = marcaData.descripcion;
                    marcaExistente.estado = true;
                    await this.marcaRepo.save(marcaExistente);
                    marcasActualizadas++;
                    console.log(`   🔄 Marca '${marcaData.nombre}' actualizada para ${marcaData.empresa.name}`);
                } else {
                    console.log(`   ℹ️  Marca '${marcaData.nombre}' ya existe para ${marcaData.empresa.name}`);
                }
            }
        }

        console.log(`\n🎉 Seed de marcas completado:`);
        console.log(`   📝 Marcas nuevas creadas: ${marcasCreadas}`);
        console.log(`   🔄 Marcas actualizadas: ${marcasActualizadas}`);
        console.log(`   📊 Total procesadas: ${marcasConEmpresa.length}`);

        // Mostrar resumen por empresa
        console.log(`\n📋 RESUMEN POR EMPRESA:`);
        console.log(`🏢 ${empresaTech.name}:`);
        const marcasTech = marcasConEmpresa.filter(m => m.empresaId === empresaTech.id);
        marcasTech.forEach(marca => console.log(`   • ${marca.nombre} - ${marca.descripcion}`));
        
        console.log(`🏢 ${empresaFood.name}:`);
        const marcasFood = marcasConEmpresa.filter(m => m.empresaId === empresaFood.id);
        marcasFood.forEach(marca => console.log(`   • ${marca.nombre} - ${marca.descripcion}`));
    }
}
