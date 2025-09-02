import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../../core/permission.entity';

@Injectable()
export class PermisosSeeder {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permisoRepo: Repository<PermissionEntity>,
    ) {}

    async run() {
        const permisos = [
        { name: 'crear_usuario', codigo: 'USR_CREATE' },
        { name: 'editar_usuario', codigo: 'USR_EDIT' },
        { name: 'eliminar_usuario', codigo: 'USR_DELETE' },
        ];

        for (const permiso of permisos) {
            const exists = await this.permisoRepo.findOne({ where: { codigo: permiso.codigo } });
            if (!exists) {
                await this.permisoRepo.save(permiso);
            }
        }
        console.log('Permisos seed completado');
    }
}
