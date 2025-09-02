import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../core/roles.entity';
import { PermissionEntity } from '../../core/permission.entity';

@Injectable()
export class RoleSeeder {
    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepo: Repository<RoleEntity>,
        @InjectRepository(PermissionEntity)
        private readonly permisoRepo: Repository<PermissionEntity>,
    ) {}

    async run() {
        const permisos = await this.permisoRepo.find();

        const roles = [
        { name: 'admin', permissions: permisos },
        ];

        for (const roleData of roles) {
            const exists = await this.roleRepo.findOne({ where: { name: roleData.name } });
            if (!exists) {
                const role = this.roleRepo.create(roleData);
                await this.roleRepo.save(role);
            }
        }

        console.log('Roles con permisos seed completado');
    }
}
