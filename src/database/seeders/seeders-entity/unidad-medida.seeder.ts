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

        // Buscar empresas por nombre
        const empresaTech = await this.empresaRepo.findOne({ where: { name: 'TechCorp S.A.' } });
        const empresaFood = await this.empresaRepo.findOne({ where: { name: 'FoodMarket Ltda.' } });

        if (!empresaTech || !empresaFood) {
        console.log('❌ No se encontraron las empresas requeridas para asignar unidades de medida');
        return;
        }

        console.log(`✅ Empresas encontradas: ${empresaTech.name} (ID: ${empresaTech.id}), ${empresaFood.name} (ID: ${empresaFood.id})`);

        const unidadesConEmpresa = [
        // 🔹 TechCorp S.A. → medidas técnicas
        { empresa_id: empresaTech.id, nombre: 'Unidad', abreviatura: 'u', aceptaDecimales: false },
        { empresa_id: empresaTech.id, nombre: 'Paquete', abreviatura: 'paq', aceptaDecimales: false },
        { empresa_id: empresaTech.id, nombre: 'Metro', abreviatura: 'm', aceptaDecimales: true },
        { empresa_id: empresaTech.id, nombre: 'Gigabyte', abreviatura: 'GB', aceptaDecimales: true },

        // 🔹 FoodMarket Ltda. → medidas de alimentos
        { empresa_id: empresaFood.id, nombre: 'Unidad', abreviatura: 'u', aceptaDecimales: false },
        { empresa_id: empresaFood.id, nombre: 'Paquete', abreviatura: 'paq', aceptaDecimales: false },
        { empresa_id: empresaFood.id, nombre: 'Kilogramo', abreviatura: 'kg', aceptaDecimales: true },
        { empresa_id: empresaFood.id, nombre: 'Gramo', abreviatura: 'g', aceptaDecimales: true },
        { empresa_id: empresaFood.id, nombre: 'Litro', abreviatura: 'l', aceptaDecimales: true },
        { empresa_id: empresaFood.id, nombre: 'Caja', abreviatura: 'caja', aceptaDecimales: false },
        ];

        let creadas = 0;
        let actualizadas = 0;

        for (const unidad of unidadesConEmpresa) {
        // Verificar si ya existe
        const existente = await this.unidadMedidaRepo.findOne({
            where: { nombre: unidad.nombre, sucursal_id: unidad.empresa_id },
        });

        if (!existente) {
            const nuevaUnidad = this.unidadMedidaRepo.create({
            nombre: unidad.nombre,
            abreviatura: unidad.abreviatura,
            aceptaDecimales: unidad.aceptaDecimales,
            sucursal_id: unidad.empresa_id,
            });
            await this.unidadMedidaRepo.save(nuevaUnidad);
            creadas++;
            console.log(`   ✅ Unidad '${unidad.nombre}' creada para empresa ID ${unidad.empresa_id}`);
        } else {
            // Actualizar si está inactiva o datos cambiaron
            if (
            existente.abreviatura !== unidad.abreviatura ||
            existente.aceptaDecimales !== unidad.aceptaDecimales
            ) {
            existente.abreviatura = unidad.abreviatura;
            existente.aceptaDecimales = unidad.aceptaDecimales;
            await this.unidadMedidaRepo.save(existente);
            actualizadas++;
            console.log(`   🔄 Unidad '${unidad.nombre}' actualizada para empresa ID ${unidad.empresa_id}`);
            } else {
            console.log(`   ℹ️ Unidad '${unidad.nombre}' ya existe para empresa ID ${unidad.empresa_id}`);
            }
        }
        }

        console.log(`\n🎉 Seed de unidades de medida completado:`);
        console.log(`   📝 Nuevas creadas: ${creadas}`);
        console.log(`   🔄 Actualizadas: ${actualizadas}`);
        console.log(`   📊 Total procesadas: ${unidadesConEmpresa.length}`);
    }
}
