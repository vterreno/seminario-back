import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from '../../core/permission.entity';
import { ListaPreciosEntity } from '../../core/lista-precios.entity';
import { RoleEntity } from '../../core/roles.entity';

@Injectable()
export class FixListaPreciosPermisosSeeder {
    constructor(
        @InjectRepository(PermissionEntity)
        private readonly permisoRepo: Repository<PermissionEntity>,
        @InjectRepository(ListaPreciosEntity)
        private readonly listaPreciosRepo: Repository<ListaPreciosEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepo: Repository<RoleEntity>,
    ) {}

    async run() {
        console.log('🔧 Iniciando migración de permisos de listas de precios...');

        // Obtener todas las listas de precios
        const listas = await this.listaPreciosRepo.find();

        for (const lista of listas) {
            // Generar código antiguo y nuevo
            const codigoAntiguo = this.normalizarNombre(lista.nombre) + '_ver';
            const codigoNuevo = 'lista_' + this.normalizarNombre(lista.nombre) + '_ver';

            console.log(`📋 Procesando lista: "${lista.nombre}"`);
            console.log(`   Permiso antiguo: ${codigoAntiguo}`);
            console.log(`   Permiso nuevo: ${codigoNuevo}`);

            // Buscar permiso antiguo
            const permisoAntiguo = await this.permisoRepo.findOne({
                where: { codigo: codigoAntiguo }
            });

            // Si el permiso antiguo no existe, continuar
            if (!permisoAntiguo) {
                console.log(`   ⚠️ No se encontró permiso antiguo, saltando...`);
                continue;
            }

            // Verificar si es un permiso de módulo general (protegido)
            const permisosProtegidos = [
                'modulo_listas_ver',
                'modulo_listas_agregar',
                'modulo_listas_modificar',
                'modulo_listas_eliminar'
            ];

            if (permisosProtegidos.includes(codigoAntiguo)) {
                console.log(`   🔒 Permiso protegido, creando nuevo permiso sin eliminar el anterior...`);
                
                // Verificar si ya existe el nuevo permiso
                const permisoExistente = await this.permisoRepo.findOne({
                    where: { codigo: codigoNuevo }
                });

                if (permisoExistente) {
                    console.log(`   ✅ El nuevo permiso ya existe`);
                    continue;
                }

                // Crear nuevo permiso
                const nuevoPermiso = this.permisoRepo.create({
                    nombre: `Ver lista de precios ${lista.nombre}`,
                    codigo: codigoNuevo,
                });
                await this.permisoRepo.save(nuevoPermiso);
                console.log(`   ✅ Nuevo permiso creado`);

                // Asignar a los mismos roles que tenían el permiso antiguo
                const roles = await this.roleRepo.createQueryBuilder('role')
                    .leftJoinAndSelect('role.permissions', 'permission')
                    .where('permission.id = :permisoId', { permisoId: permisoAntiguo.id })
                    .getMany();

                for (const role of roles) {
                    if (!role.permissions.some(p => p.id === nuevoPermiso.id)) {
                        role.permissions.push(nuevoPermiso);
                        await this.roleRepo.save(role);
                        console.log(`   ✅ Permiso asignado al rol: ${role.nombre}`);
                    }
                }
            } else {
                // No es un permiso protegido, actualizar el código
                console.log(`   🔄 Actualizando código de permiso...`);
                permisoAntiguo.codigo = codigoNuevo;
                permisoAntiguo.nombre = `Ver lista de precios ${lista.nombre}`;
                await this.permisoRepo.save(permisoAntiguo);
                console.log(`   ✅ Permiso actualizado`);
            }
        }

        console.log('✅ Migración de permisos completada');
    }

    private normalizarNombre(nombre: string): string {
        return nombre.trim().toLowerCase().replace(/\s+/g, '_');
    }
}
