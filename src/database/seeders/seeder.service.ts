import { Injectable } from '@nestjs/common';
import { RoleSeeder } from './seeders-entity/role.seeder';
import { PermisosSeeder } from './seeders-entity/permisos.seeder';
import { UserSeeder } from './seeders-entity/users.seeder';
import { EmpresaSeeder } from './seeders-entity/empresa.seeder';
import { VincularSuperadminPermisosSeeder } from './seeders-entity/vincular-superadmin-permisos.seeder';
import { EmpresaUsuarioRolSeeder } from './seeders-entity/empresa-usuario-rol.seeder';

@Injectable()
export class SeederService {
    constructor(
        private readonly roleSeeder: RoleSeeder,
        private readonly permisosSeeder: PermisosSeeder,
        private readonly userSeeder: UserSeeder,
        private readonly empresaSeeder: EmpresaSeeder,
        private readonly vincularSuperadminPermisosSeeder: VincularSuperadminPermisosSeeder,
        private readonly empresaUsuarioRolSeeder: EmpresaUsuarioRolSeeder,
    ) {}

    async seedAll() {
        console.log('Iniciando seeding');
        await this.empresaSeeder.run();
        await this.roleSeeder.run();
        await this.permisosSeeder.run();
        await this.userSeeder.run();
        await this.vincularSuperadminPermisosSeeder.run();
        await this.empresaUsuarioRolSeeder.run();
        console.log('Seeding completo');
    }
}
