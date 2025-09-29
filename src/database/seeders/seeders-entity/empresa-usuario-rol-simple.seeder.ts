import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { empresaEntity } from '../../core/empresa.entity';
import { UserEntity } from '../../core/user.entity';
import { RoleEntity } from '../../core/roles.entity';
import { PermissionEntity } from '../../core/permission.entity';
import { hashSync } from 'bcrypt';

@Injectable()
export class EmpresaUsuarioRolSimpleSeeder {
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
        console.log('🚀 Iniciando seed simplificado de usuarios y roles...');
        
        // === 1. OBTENER EMPRESAS EXISTENTES ===
        const empresaTech = await this.empresaRepo.findOne({ where: { name: 'TechCorp S.A.' } });
        const empresaFood = await this.empresaRepo.findOne({ where: { name: 'FoodMarket Ltda.' } });
        
        if (!empresaTech || !empresaFood) {
            console.log('❌ No se encontraron las empresas. Ejecuta primero el seeder de empresas.');
            return;
        }
        
        console.log(`✅ Empresas encontradas: ${empresaTech.name} (ID: ${empresaTech.id}), ${empresaFood.name} (ID: ${empresaFood.id})`);

        // === 2. OBTENER PERMISOS ===
        const todosLosPermisos = await this.permisoRepo.find();
        const permisosLectura = await this.permisoRepo.find({
            where: [
                { codigo: 'dashboard_ver' },
                { codigo: 'usuario_ver' },
                { codigo: 'roles_ver' },
                { codigo: 'producto_ver' },
                { codigo: 'marca_ver' },
                { codigo: 'categoria_ver' },
                { codigo: 'ventas_ver' },
                { codigo: 'compras_ver' },
                { codigo: 'cliente_ver' },
                { codigo: 'proveedor_ver' },
                { codigo: 'sucursal_ver' },
                // Permisos completos de unidades de medida para todos
                { codigo: 'unidad_medida_ver' },
                { codigo: 'unidad_medida_agregar' },
                { codigo: 'unidad_medida_modificar' },
                { codigo: 'unidad_medida_eliminar' }
            ]
        });

        // === 3. CREAR USUARIOS Y ROLES ===

        // 🔹 SUPERADMIN (sin empresa)
        await this.crearUsuarioYRol({
            email: 'superadmin@sistema.com',
            password: 'super123',
            nombre: 'Super',
            apellido: 'Admin',
            rolNombre: 'Superadmin',
            empresa: null,
            permisos: todosLosPermisos,
            descripcion: 'Superadministrador del sistema (acceso total)'
        });

        // 🔹 ADMIN DE TECHCORP
        await this.crearUsuarioYRol({
            email: 'admin@techcorp.com',
            password: 'tech123',
            nombre: 'Administrador',
            apellido: 'TechCorp',
            rolNombre: 'AdminTech',
            empresa: empresaTech,
            permisos: todosLosPermisos,
            descripcion: 'Administrador completo de TechCorp'
        });

        // 🔹 USUARIO LIMITADO DE TECHCORP (solo lectura)
        await this.crearUsuarioYRol({
            email: 'usuario@techcorp.com',
            password: 'user123',
            nombre: 'Usuario',
            apellido: 'TechCorp',
            rolNombre: 'UsuarioTech',
            empresa: empresaTech,
            permisos: permisosLectura,
            descripcion: 'Usuario con permisos de solo lectura en TechCorp'
        });

        // 🔹 ADMIN DE FOODMARKET
        await this.crearUsuarioYRol({
            email: 'admin@foodmarket.com',
            password: 'food123',
            nombre: 'Administrador',
            apellido: 'FoodMarket',
            rolNombre: 'AdminFood',
            empresa: empresaFood,
            permisos: todosLosPermisos,
            descripcion: 'Administrador completo de FoodMarket'
        });

        // 🔹 GESTOR@MAIL.COM - Usuario con permisos completos en TechCorp
        await this.crearUsuarioYRol({
            email: 'gestor@mail.com',
            password: 'gestor123',
            nombre: 'Gestor',
            apellido: 'Mail',
            rolNombre: 'GestorMail',
            empresa: empresaTech,
            permisos: todosLosPermisos,
            descripcion: 'Gestor con permisos completos en TechCorp'
        });

        console.log('\n🎉 Seed de usuarios y roles completado exitosamente!');
        console.log('\n📋 USUARIOS CREADOS:');
        console.log('1. superadmin@sistema.com / super123 - Superadmin (sin empresa)');
        console.log('2. admin@techcorp.com / tech123 - Admin completo TechCorp');
        console.log('3. usuario@techcorp.com / user123 - Usuario con unidades de medida TechCorp');
        console.log('4. admin@foodmarket.com / food123 - Admin completo FoodMarket');
        console.log('5. gestor@mail.com / gestor123 - Gestor completo TechCorp');
    }

    private async crearUsuarioYRol(datos: {
        email: string;
        password: string;
        nombre: string;
        apellido: string;
        rolNombre: string;
        empresa: empresaEntity | null;
        permisos: PermissionEntity[];
        descripcion: string;
    }) {
        console.log(`\n📝 Creando: ${datos.descripcion}...`);

        // Verificar si el usuario ya existe
        let usuario = await this.userRepo.findOne({ where: { email: datos.email } });
        
        // Crear rol
        let rol = await this.roleRepo.findOne({ 
            where: { 
                nombre: datos.rolNombre,
                empresa_id: datos.empresa?.id || null 
            }, 
            relations: ['permissions'] 
        });

        if (!rol) {
            rol = this.roleRepo.create({
                nombre: datos.rolNombre,
                empresa_id: datos.empresa?.id || null,
                estado: true,
                permissions: datos.permisos,
                empresa: datos.empresa
            });
            rol = await this.roleRepo.save(rol);
            console.log(`   ✅ Rol '${datos.rolNombre}' creado con ${datos.permisos.length} permisos`);
        } else {
            // Actualizar permisos del rol si ya existe
            rol.permissions = datos.permisos;
            rol.estado = true;
            await this.roleRepo.save(rol);
            console.log(`   ✅ Rol '${datos.rolNombre}' actualizado`);
        }

        // Crear usuario
        if (!usuario) {
            usuario = this.userRepo.create({
                email: datos.email,
                password: hashSync(datos.password, 10),
                nombre: datos.nombre,
                apellido: datos.apellido,
                empresa: datos.empresa,
                role: rol
            });
            await this.userRepo.save(usuario);
            console.log(`   ✅ Usuario '${datos.email}' creado`);
        } else {
            // Actualizar usuario existente
            usuario.role = rol;
            usuario.empresa = datos.empresa;
            await this.userRepo.save(usuario);
            console.log(`   ✅ Usuario '${datos.email}' actualizado`);
        }
    }
}
