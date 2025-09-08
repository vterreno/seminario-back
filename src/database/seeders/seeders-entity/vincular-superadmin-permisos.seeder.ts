import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../core/roles.entity';
import { PermissionEntity } from '../../core/permission.entity';

@Injectable()
export class VincularSuperadminPermisosSeeder {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepo: Repository<RoleEntity>,
        @InjectRepository(PermissionEntity)
        private readonly permisoRepo: Repository<PermissionEntity>,
    ) {}

    async run() {
        // Buscar el rol superadmin sin empresa_id
        const superadmin = await this.roleRepo.findOne({
            where: { nombre: 'Superadmin', empresa_id: null },
            relations: ['permissions']
        });
        if (!superadmin) {
            console.log('No existe el rol Superadmin sin empresa_id');
            return;
        }
        // Obtener todos los permisos
        const permisos = await this.permisoRepo.find();
        // Vincular todos los permisos al rol superadmin
        superadmin.permissions = permisos;
        await this.roleRepo.save(superadmin);
        console.log('Permisos vinculados al rol Superadmin sin empresa_id');
    }
}
