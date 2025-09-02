import { Injectable } from '@nestjs/common';
import { RoleSeeder } from './seeders-entity/role.seeder';
import { PermisosSeeder } from './seeders-entity/permisos.seeder';
import { UserSeeder } from './seeders-entity/users.seeder';

@Injectable()
export class SeederService {
    constructor(
        private readonly roleSeeder: RoleSeeder,
        private readonly permisosSeeder: PermisosSeeder,
        private readonly userSeeder: UserSeeder,
    ) {}

    async seedAll() {
        console.log('Iniciando seeding');
        await this.roleSeeder.run();
        await this.permisosSeeder.run();
        await this.userSeeder.run();
        console.log('Seeding completo');
    }
}
