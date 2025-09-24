import { Injectable } from '@nestjs/common';
import { MasterSeeder } from './seeders-entity/master.seeder';
import { UnidadesMedidaSeeder } from './unidades-medida.seeder';

@Injectable()
export class SeederService {
    constructor(
        private readonly masterSeeder: MasterSeeder,
        private readonly unidadesMedidaSeeder: UnidadesMedidaSeeder,
    ) {}

    async seedAll() {
        console.log('🚀 Iniciando seeding completo con datos simplificados...');
        await this.masterSeeder.run();
        await this.unidadesMedidaSeeder.run();
        console.log('✅ Seeding completo finalizado');
    }
}
