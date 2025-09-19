// src/database/seeders/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSeeder } from './seeders-entity/role.seeder';
import { RoleEntity } from '../core/roles.entity';
import { PermissionEntity } from '../core/permission.entity';
import { UserEntity } from '../core/user.entity';
import { SeederService } from './seeder.service';
import { PermisosSeeder } from './seeders-entity/permisos.seeder';
import { UserSeeder } from './seeders-entity/users.seeder';
import { EmpresaSeeder } from './seeders-entity/empresa.seeder';
import { empresaEntity } from '../core/empresa.entity';
import { VincularSuperadminPermisosSeeder } from './seeders-entity/vincular-superadmin-permisos.seeder';
import { EmpresaUsuarioRolSeeder } from './seeders-entity/empresa-usuario-rol.seeder';
import { UnidadesMedidaSeeder } from './unidades-medida.seeder';
import { UnidadMedida } from '../core/unidad-medida.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([RoleEntity, PermissionEntity, UserEntity, empresaEntity, UnidadMedida]),
    ],
    providers: [
        RoleSeeder,
        PermisosSeeder,
        UserSeeder,
        EmpresaSeeder,
        VincularSuperadminPermisosSeeder,
        EmpresaUsuarioRolSeeder,
        UnidadesMedidaSeeder,
        SeederService,
    ],
    exports: [SeederService],
})
export class SeedModule {}

