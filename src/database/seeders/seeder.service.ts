import { Injectable } from '@nestjs/common';
import { MasterSeeder } from './seeders-entity/master.seeder';

@Injectable()
export class SeederService {
    constructor(
        private readonly masterSeeder: MasterSeeder,
    ) {}

    async seedAll() {
        console.log('🚀 Iniciando seeding completo con datos simplificados...');
        await this.masterSeeder.run();
        console.log('✅ Seeding completo finalizado');
    }
}
