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
        { nombre: 'Superadmin', permissions: permisos },
        ];

        for (const roleData of roles) {
            let role = await this.roleRepo.findOne({ 
                where: { nombre: roleData.nombre },
                relations: ['permissions']
            });
            
            if (!role) {
                // Create new role if it doesn't exist
                role = this.roleRepo.create(roleData);
                await this.roleRepo.save(role);
                console.log(`Rol '${roleData.nombre}' creado con ${permisos.length} permisos`);
            } else {
                // Update existing role with all permissions
                role.permissions = permisos;
                await this.roleRepo.save(role);
                console.log(`Rol '${roleData.nombre}' actualizado con ${permisos.length} permisos`);
            }
        }

        console.log('Roles con permisos seed completado');
    }
}
