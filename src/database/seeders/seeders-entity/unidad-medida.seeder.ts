import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnidadMedidaEntity } from 'src/database/core/unidad-medida.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';

@Injectable()
export class UnidadMedidaSeeder {
    constructor(
        @InjectRepository(UnidadMedidaEntity)
        private readonly unidadMedidaRepo: Repository<UnidadMedidaEntity>,
        @InjectRepository(empresaEntity)
        private readonly empresaRepo: Repository<empresaEntity>,
    ) {}

    async run() {
        console.log('⚖️ Iniciando seed de unidades de medida...');

        // Buscar empresas activas
        const empresas = await this.empresaRepo.find({ where: { estado: true } });

        if (empresas.length === 0) {
            console.log('❌ No se encontraron empresas activas para asignar unidades de medida');
            return;
        }

        console.log(`✅ Empresas activas encontradas: ${empresas.length}`);

        // Definir unidades de medida estándar para todas las sucursales
        const unidadesBase = [
            { nombre: 'Unidad', abreviatura: 'u', aceptaDecimales: false },
            { nombre: 'Paquete', abreviatura: 'paq', aceptaDecimales: false },
            { nombre: 'Kilogramo', abreviatura: 'kg', aceptaDecimales: true },
            { nombre: 'Gramo', abreviatura: 'g', aceptaDecimales: true },
            { nombre: 'Litro', abreviatura: 'l', aceptaDecimales: true },
            { nombre: 'Metro', abreviatura: 'm', aceptaDecimales: true },
            { nombre: 'Caja', abreviatura: 'caja', aceptaDecimales: false },
        ];

        let creadas = 0;
        let actualizadas = 0;

        // Crear unidades de medida para cada empresa
        for (const empresa of empresas) {
            console.log(`\n   📍 Procesando empresa: ${empresa.name} (ID: ${empresa.id})`);
            
            for (const unidad of unidadesBase) {
                // Verificar si ya existe
                const existente = await this.unidadMedidaRepo.findOne({
                    where: { nombre: unidad.nombre, empresa_id: empresa.id },
                });

                if (!existente) {
                    const nuevaUnidad = this.unidadMedidaRepo.create({
                        nombre: unidad.nombre,
                        abreviatura: unidad.abreviatura,
                        aceptaDecimales: unidad.aceptaDecimales,
                        empresa_id: empresa.id,
                        estado: true,
                    });
                    await this.unidadMedidaRepo.save(nuevaUnidad);
                    creadas++;
                    console.log(`      ✅ Unidad '${unidad.nombre}' creada`);
                } else {
                    // Actualizar si está inactiva o datos cambiaron
                    if (
                        !existente.estado ||
                        existente.abreviatura !== unidad.abreviatura ||
                        existente.aceptaDecimales !== unidad.aceptaDecimales
                    ) {
                        existente.abreviatura = unidad.abreviatura;
                        existente.aceptaDecimales = unidad.aceptaDecimales;
                        existente.estado = true;
                        await this.unidadMedidaRepo.save(existente);
                        actualizadas++;
                        console.log(`      🔄 Unidad '${unidad.nombre}' actualizada`);
                    } else {
                        console.log(`      ℹ️  Unidad '${unidad.nombre}' ya existe`);
                    }
                }
            }
        }

        console.log(`\n🎉 Seed de unidades de medida completado:`);
        console.log(`   📝 Nuevas creadas: ${creadas}`);
        console.log(`   🔄 Actualizadas: ${actualizadas}`);
        console.log(`   📊 Total procesadas: ${empresas.length * unidadesBase.length}`);
    }
}
