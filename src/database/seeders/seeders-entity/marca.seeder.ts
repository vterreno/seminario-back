import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarcaEntity } from 'src/database/core/marcas.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { marcasPorEmpresa } from './data/marca.data';

@Injectable()
export class MarcaSeeder {
    constructor(
        @InjectRepository(MarcaEntity)
        private readonly marcaRepo: Repository<MarcaEntity>,
        @InjectRepository(empresaEntity)
        private readonly empresaRepo: Repository<empresaEntity>,
    ) {}

    async run() {
        console.log('🏷️  Iniciando seed de marcas...');
        
        let totalCreadas = 0;
        let totalActualizadas = 0;
        let totalProcesadas = 0;

        // Procesar cada empresa
        for (const [nombreEmpresa, marcas] of Object.entries(marcasPorEmpresa)) {
            const empresa = await this.empresaRepo.findOne({ 
                where: { name: nombreEmpresa } 
            });

            if (!empresa) {
                console.log(`   ⚠️  Empresa '${nombreEmpresa}' no encontrada, saltando...`);
                continue;
            }

            console.log(`\n   📋 Procesando marcas para: ${nombreEmpresa}`);

            for (const marcaData of marcas) {
                totalProcesadas++;
                
                // Verificar si ya existe
                const marcaExistente = await this.marcaRepo.findOne({
                    where: { 
                        nombre: marcaData.nombre, 
                        empresa_id: empresa.id 
                    },
                });

                if (!marcaExistente) {
                    const nuevaMarca = this.marcaRepo.create({
                        nombre: marcaData.nombre,
                        descripcion: marcaData.descripcion,
                        empresa_id: empresa.id,
                        estado: true,
                    });

                    await this.marcaRepo.save(nuevaMarca);
                    totalCreadas++;
                    console.log(`      ✅ ${marcaData.nombre} creada`);
                } else {
                    // Actualizar si existe pero está inactiva o tiene datos diferentes
                    let necesitaActualizacion = false;
                    
                    if (!marcaExistente.estado) {
                        marcaExistente.estado = true;
                        necesitaActualizacion = true;
                    }
                    
                    if (marcaExistente.descripcion !== marcaData.descripcion) {
                        marcaExistente.descripcion = marcaData.descripcion;
                        necesitaActualizacion = true;
                    }

                    if (necesitaActualizacion) {
                        await this.marcaRepo.save(marcaExistente);
                        totalActualizadas++;
                        console.log(`      🔄 ${marcaData.nombre} actualizada`);
                    } else {
                        console.log(`      ℹ️  ${marcaData.nombre} ya existe`);
                    }
                }
            }
        }

        console.log(`\n   🎉 Seed de marcas completado:`);
        console.log(`      📝 Nuevas: ${totalCreadas}`);
        console.log(`      🔄 Actualizadas: ${totalActualizadas}`);
        console.log(`      📊 Total: ${totalProcesadas}`);
    }
}
