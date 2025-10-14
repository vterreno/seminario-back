import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { empresaEntity } from '../../core/empresa.entity';
import { UserEntity } from '../../core/user.entity';
import { RoleEntity } from '../../core/roles.entity';
import { PermissionEntity } from '../../core/permission.entity';
import { hashSync } from 'bcrypt';
import { usuariosYRoles, permisosExcluidosAdmin, permisosLectura } from './data/usuario-rol.data';

@Injectable()
export class EmpresaUsuarioRolSeeder {
    constructor(
        @InjectRepository(empresaEntity)
        private readonly empresaRepo: Repository<empresaEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(RoleEntity)
        private readonly roleRepo: Repository<RoleEntity>,
        @InjectRepository(PermissionEntity)
        private readonly permisoRepo: Repository<PermissionEntity>,
    ) {}

    async run() {
        console.log('👥 Iniciando seed de usuarios y roles...');
        
        // Obtener todos los permisos disponibles
        const todosLosPermisos = await this.permisoRepo.find();
        const permisosAdmin = await this.permisoRepo.find({
            where: { codigo: Not(In(permisosExcluidosAdmin)) }
        });
        const permisosLecturaEntities = await this.permisoRepo.find({
            where: permisosLectura.map(codigo => ({ codigo }))
        });

        let totalCreados = 0;
        let totalActualizados = 0;

        for (const userData of usuariosYRoles) {
            console.log(`\n   📝 Procesando: ${userData.descripcion}`);
            
            // Obtener empresa si aplica
            let empresa: empresaEntity | null = null;
            if (userData.empresaNombre) {
                empresa = await this.empresaRepo.findOne({ 
                    where: { name: userData.empresaNombre } 
                });
                
                if (!empresa) {
                    console.log(`      ⚠️  Empresa '${userData.empresaNombre}' no encontrada, saltando...`);
                    continue;
                }
            }

            // Determinar permisos según el tipo
            let permisos: PermissionEntity[];
            switch (userData.tipoPermisos) {
                case 'todos':
                    permisos = todosLosPermisos;
                    break;
                case 'administrador':
                    permisos = permisosAdmin;
                    break;
                case 'lectura':
                    permisos = permisosLecturaEntities;
                    break;
                default:
                    permisos = [];
            }

            // Crear o actualizar rol
            let rol = await this.roleRepo.findOne({ 
                where: { 
                    nombre: userData.rolNombre,
                    empresa_id: empresa?.id || null 
                }, 
                relations: ['permissions'] 
            });

            if (!rol) {
                rol = this.roleRepo.create({
                    nombre: userData.rolNombre,
                    empresa_id: empresa?.id || null,
                    estado: true,
                    permissions: permisos,
                });
                await this.roleRepo.save(rol);
                console.log(`      ✅ Rol '${userData.rolNombre}' creado con ${permisos.length} permisos`);
            } else {
                // Actualizar permisos si el rol existe
                rol.permissions = permisos;
                rol.estado = true;
                await this.roleRepo.save(rol);
                console.log(`      🔄 Rol '${userData.rolNombre}' actualizado`);
            }

            // Crear o actualizar usuario
            let usuario = await this.userRepo.findOne({ 
                where: { email: userData.email },
                relations: ['role']
            });

            if (!usuario) {
                usuario = this.userRepo.create({
                    nombre: userData.nombre,
                    apellido: userData.apellido,
                    email: userData.email,
                    password: hashSync(userData.password, 10),
                    empresa: empresa,
                    role: rol,
                });
                await this.userRepo.save(usuario);
                totalCreados++;
                console.log(`      ✅ Usuario '${userData.email}' creado`);
            } else {
                // Actualizar rol del usuario si es diferente
                if (usuario.role?.id !== rol.id) {
                    usuario.role = rol;
                    await this.userRepo.save(usuario);
                    totalActualizados++;
                    console.log(`      🔄 Usuario '${userData.email}' actualizado`);
                } else {
                    console.log(`      ℹ️  Usuario '${userData.email}' ya existe`);
                }
            }
        }

        console.log(`\n   🎉 Seed de usuarios y roles completado:`);
        console.log(`      📝 Nuevos: ${totalCreados}`);
        console.log(`      🔄 Actualizados: ${totalActualizados}`);
        console.log(`      📊 Total: ${usuariosYRoles.length}`);
    }
}
