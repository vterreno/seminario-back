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
import { MarcaEntity } from '../core/marcas.entity';
import { ProductoEntity } from '../core/producto.entity';
import { MasterSeeder } from './seeders-entity/master.seeder';
import { EmpresaUsuarioRolSimpleSeeder } from './seeders-entity/empresa-usuario-rol-simple.seeder';
import { MarcaSimpleSeeder } from './seeders-entity/marca-simple.seeder';
import { ProductoSimpleSeeder } from './seeders-entity/producto-simple.seeder';

@Module({
    imports: [
        TypeOrmModule.forFeature([RoleEntity, PermissionEntity, UserEntity, empresaEntity, MarcaEntity, ProductoEntity]),
    ],
    providers: [
        // Seeders principales
        PermisosSeeder,
        EmpresaSeeder,
        RoleSeeder,
        UserSeeder,
        // Seeders simplificados
        EmpresaUsuarioRolSimpleSeeder,
        MarcaSimpleSeeder,
        ProductoSimpleSeeder,
        // Seeder maestro
        MasterSeeder,
        SeederService,
    ],
    exports: [SeederService],
})
export class SeedModule {}

