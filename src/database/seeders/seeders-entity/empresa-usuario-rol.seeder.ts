import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { empresaEntity } from '../../core/empresa.entity';
import { UserEntity } from '../../core/user.entity';
import { RoleEntity } from '../../core/roles.entity';
import { PermissionEntity } from '../../core/permission.entity';
import { hashSync } from 'bcrypt';

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
        // 1. Crear empresa de prueba
        let empresa = await this.empresaRepo.findOne({ where: { name: 'Empresa Prueba' } });
        
        if (!empresa) {
            empresa = this.empresaRepo.create({ name: 'Empresa Prueba', estado: true });
            empresa = await this.empresaRepo.save(empresa);
            console.log('Empresa de prueba creada');
        }
        // 2. Crear usuario asociado a la empresa
        let usuario = await this.userRepo.findOne({ where: { email: 'test@mail.com' } });
        if (!usuario) {
            usuario = this.userRepo.create({
                nombre: 'Usuario',
                apellido: 'Prueba',
                email: 'test@mail.com',
                password: hashSync('test123', 10),
                empresa: empresa
            });
            usuario = await this.userRepo.save(usuario);
            console.log('Usuario de prueba creado');
        }
        // 3. Crear rol con todos los permisos asociado a la empresa - FORZAR ACTUALIZACIÓN
        let rol = await this.roleRepo.findOne({ where: { nombre: 'AdminPrueba', empresa_id: empresa.id }, relations: ['permissions'] });
        
        const permisos = await this.permisoRepo.find();
        
        if (!rol) {
            rol = this.roleRepo.create({
                nombre: 'AdminPrueba',
                empresa_id: empresa.id,
                estado: true,
                permissions: permisos,
                empresa: empresa
            });
            rol = await this.roleRepo.save(rol);
            console.log('Rol de prueba creado con todos los permisos');
        } else {
            // ACTUALIZAR EL ROL EXISTENTE CON TODOS LOS PERMISOS
            rol.permissions = permisos;
            rol.estado = true;
            await this.roleRepo.save(rol);
            console.log(`Rol AdminPrueba actualizado con ${permisos.length} permisos (incluyendo unidades de medida)`);
        }
        // 4. Asociar el rol al usuario
        usuario.role = rol;
        await this.userRepo.save(usuario);
        console.log('Rol de prueba vinculado al usuario de prueba');

        // 5. USUARIO OPERADOR SOLO LECTURA - Ver productos, ventas y compras
        let usuarioOperador = await this.userRepo.findOne({ where: { email: 'operador@test.com' } });
        if (!usuarioOperador) {
            usuarioOperador = this.userRepo.create({
                nombre: 'Operador',
                apellido: 'Solo Lectura',
                email: 'operador@test.com',
                password: hashSync('operador123', 10),
                empresa: empresa
            });
            usuarioOperador = await this.userRepo.save(usuarioOperador);
            console.log('Usuario Operador Solo Lectura creado');
        }

        // 6. ROL OPERADOR SOLO LECTURA
        let rolOperador = await this.roleRepo.findOne({ 
            where: { nombre: 'OperadorPrueba', empresa_id: empresa.id }, 
            relations: ['permissions'] 
        });
        if (!rolOperador) {
            const permisosOperador = await this.permisoRepo.find({
                where: [
                    { codigo: 'usuario_ver'},
                    { codigo: 'roles_ver' },
                    { codigo: 'sucursal_ver' },
                    { codigo: 'producto_ver' },
                    { codigo: 'marca_ver' },
                    { codigo: 'categoria_ver' },
                    { codigo: 'ventas_ver' },
                    { codigo: 'compras_ver' },
                    { codigo: 'unidad_medida_ver' } // Añadido permiso para ver unidades de medida
                ]
            });
            
            rolOperador = this.roleRepo.create({
                nombre: 'OperadorPrueba',
                empresa_id: empresa.id,
                estado: true,
                permissions: permisosOperador,
                empresa: empresa
            });
            rolOperador = await this.roleRepo.save(rolOperador);
            console.log('Rol OperadorPrueba creado con permisos de solo lectura');
        } else {
            // Si el rol ya existe, asegurar que esté activo
            if (!rolOperador.estado) {
                rolOperador.estado = true;
                await this.roleRepo.save(rolOperador);
                console.log('Rol OperadorPrueba reactivado');
            }
            console.log('Rol OperadorPrueba ya existe y está activo');
        }

        // 7. USUARIO GESTOR DE PRODUCTOS - Ver + gestionar productos, ver ventas y compras
        let usuarioGestor = await this.userRepo.findOne({ where: { email: 'gestor@test.com' } });
        if (!usuarioGestor) {
            usuarioGestor = this.userRepo.create({
                nombre: 'Gestor',
                apellido: 'Productos',
                email: 'gestor@test.com',
                password: hashSync('gestor123', 10),
                empresa: empresa
            });
            usuarioGestor = await this.userRepo.save(usuarioGestor);
            console.log('Usuario Gestor Productos creado');
        }

        // 7.1. USUARIO GESTOR@MAIL.COM - Mismos permisos que gestor@test.com
        let usuarioGestorMail = await this.userRepo.findOne({ where: { email: 'gestor@mail.com' } });
        if (!usuarioGestorMail) {
            usuarioGestorMail = this.userRepo.create({
                nombre: 'Gestor',
                apellido: 'Mail',
                email: 'gestor@mail.com',
                password: hashSync('gestor123', 10),
                empresa: empresa
            });
            usuarioGestorMail = await this.userRepo.save(usuarioGestorMail);
            console.log('Usuario Gestor Mail creado');
        }

        // 8. ROL GESTOR DE PRODUCTOS - FORZAR ACTUALIZACIÓN
        let rolGestor = await this.roleRepo.findOne({ 
            where: { nombre: 'GestorPrueba', empresa_id: empresa.id }, 
            relations: ['permissions'] 
        });
        
        const permisosGestor = await this.permisoRepo.find({
            where: [
                { codigo: 'usuario_ver'},
                { codigo: 'usuario_agregar'},
                { codigo: 'usuario_modificar'},
                { codigo: 'usuario_eliminar'},
                { codigo: 'producto_ver' },
                { codigo: 'producto_agregar' },
                { codigo: 'producto_modificar' },
                { codigo: 'producto_eliminar' },
                { codigo: 'marca_ver' },
                { codigo: 'marca_agregar' },
                { codigo: 'marca_modificar' },
                { codigo: 'marca_eliminar' },
                { codigo: 'categoria_ver' },
                { codigo: 'categoria_agregar' },
                { codigo: 'categoria_modificar' },
                { codigo: 'categoria_eliminar' },
                { codigo: 'roles_ver' },
                { codigo: 'roles_agregar' },
                { codigo: 'roles_modificar' },
                { codigo: 'roles_eliminar' },
                { codigo: 'sucursal_ver' },
                { codigo: 'sucursal_agregar' },
                { codigo: 'sucursal_modificar' },
                { codigo: 'sucursal_eliminar' },
                { codigo: 'ventas_ver' },
                { codigo: 'compras_ver' },
                { codigo: 'configuracion_empresa'},
                // Añadidos permisos para unidades de medida
                { codigo: 'unidad_medida_ver' },
                { codigo: 'unidad_medida_agregar' },
                { codigo: 'unidad_medida_modificar' },
                { codigo: 'unidad_medida_eliminar' },
            ]
        });

        if (!rolGestor) {
            rolGestor = this.roleRepo.create({
                nombre: 'GestorPrueba',
                empresa_id: empresa.id,
                estado: true,
                permissions: permisosGestor,
                empresa: empresa
            });
            rolGestor = await this.roleRepo.save(rolGestor);
            console.log('Rol GestorPrueba creado con gestión completa de productos + lectura ventas/compras');
        } else {
            // ACTUALIZAR EL ROL EXISTENTE CON LOS NUEVOS PERMISOS
            rolGestor.permissions = permisosGestor;
            rolGestor.estado = true;
            await this.roleRepo.save(rolGestor);
            console.log(`Rol GestorPrueba actualizado con ${permisosGestor.length} permisos (incluyendo unidades de medida)`);
        }

        // 9. Asociar roles a los nuevos usuarios
        usuarioOperador.role = rolOperador;
        await this.userRepo.save(usuarioOperador);
        console.log('Rol OperadorPrueba vinculado al usuario operador@test.com');

        usuarioGestor.role = rolGestor;
        await this.userRepo.save(usuarioGestor);
        console.log('Rol GestorPrueba vinculado al usuario gestor@test.com');

        // 9.1. Asociar rol GestorPrueba al usuario gestor@mail.com
        usuarioGestorMail.role = rolGestor;
        await this.userRepo.save(usuarioGestorMail);
        console.log('Rol GestorPrueba vinculado al usuario gestor@mail.com');

        // 10. USUARIO GESTOR1 - Ver + Crear (sin modificar ni eliminar)
        let usuarioGestor1 = await this.userRepo.findOne({ where: { email: 'gestor1@test.com' } });
        if (!usuarioGestor1) {
            usuarioGestor1 = this.userRepo.create({
                nombre: 'Gestor1',
                apellido: 'Crear Entidades',
                email: 'gestor1@test.com',
                password: hashSync('gestor1123', 10),
                empresa: empresa
            });
            usuarioGestor1 = await this.userRepo.save(usuarioGestor1);
            console.log('Usuario Gestor1 Crear Entidades creado');
        }

        // 11. ROL GESTOR1 - Ver todos + Crear/Agregar todos
        let rolGestor1 = await this.roleRepo.findOne({ 
            where: { nombre: 'Gestor1Prueba', empresa_id: empresa.id }, 
            relations: ['permissions'] 
        });
        if (!rolGestor1) {
            const permisosGestor1 = await this.permisoRepo.find({
                where: [
                    // Permisos de VER (como operador)
                    { codigo: 'usuario_ver'},
                    { codigo: 'roles_ver' },
                    { codigo: 'empresa_ver' },
                    { codigo: 'sucursal_ver' },
                    { codigo: 'producto_ver' },
                    { codigo: 'ventas_ver' },
                    { codigo: 'compras_ver' },
                    { codigo: 'dashboard_ver' },
                    { codigo: 'configuracion_empresa'},
                    { codigo: 'unidad_medida_ver' }, // Añadido
                    // Permisos de AGREGAR/CREAR
                    { codigo: 'usuario_agregar'},
                    { codigo: 'roles_agregar' },
                    { codigo: 'empresa_agregar' },
                    { codigo: 'sucursal_agregar' },
                    { codigo: 'producto_agregar' },
                    { codigo: 'ventas_agregar' },
                    { codigo: 'compras_agregar' },
                    { codigo: 'unidad_medida_agregar' } // Añadido
                ]
            });
            
            rolGestor1 = this.roleRepo.create({
                nombre: 'Gestor1Prueba',
                empresa_id: empresa.id,
                estado: true,
                permissions: permisosGestor1,
                empresa: empresa
            });
            rolGestor1 = await this.roleRepo.save(rolGestor1);
            console.log('Rol Gestor1Prueba creado con permisos de ver + crear');
        } else {
            // Si el rol ya existe, asegurar que esté activo
            if (!rolGestor1.estado) {
                rolGestor1.estado = true;
                await this.roleRepo.save(rolGestor1);
                console.log('Rol Gestor1Prueba reactivado');
            }
            console.log('Rol Gestor1Prueba ya existe y está activo');
        }

        // 12. Asociar rol al usuario gestor1
        usuarioGestor1.role = rolGestor1;
        await this.userRepo.save(usuarioGestor1);
        console.log('Rol Gestor1Prueba vinculado al usuario gestor1@test.com');

        // 13. CREAR SEGUNDA EMPRESA DE PRUEBA
        let empresa2 = await this.empresaRepo.findOne({ where: { name: 'Empresa Comercial S.A.' } });
        if (!empresa2) {
            empresa2 = this.empresaRepo.create({ 
                name: 'Empresa Comercial S.A.', 
                estado: true 
            });
            empresa2 = await this.empresaRepo.save(empresa2);
            console.log('Segunda empresa de prueba "Empresa Comercial S.A." creada');
        }

        // 14. CREAR USUARIO ADMINISTRADOR PARA LA SEGUNDA EMPRESA
        let adminEmpresa2 = await this.userRepo.findOne({ where: { email: 'admin@comercial.com' } });
        if (!adminEmpresa2) {
            adminEmpresa2 = this.userRepo.create({
                nombre: 'Carlos',
                apellido: 'Administrador',
                email: 'admin@comercial.com',
                password: hashSync('admin123', 10),
                empresa: empresa2
            });
            adminEmpresa2 = await this.userRepo.save(adminEmpresa2);
            console.log('Usuario administrador para Empresa Comercial S.A. creado');
        }

        // 15. CREAR ROL ADMINISTRADOR COMPLETO PARA LA SEGUNDA EMPRESA
        let rolAdminEmpresa2 = await this.roleRepo.findOne({ 
            where: { nombre: 'AdminComercial', empresa_id: empresa2.id }, 
            relations: ['permissions'] 
        });
        if (!rolAdminEmpresa2) {
            const todosLosPermisos = await this.permisoRepo.find();
            
            rolAdminEmpresa2 = this.roleRepo.create({
                nombre: 'AdminComercial',
                empresa_id: empresa2.id,
                estado: true,
                permissions: todosLosPermisos,
                empresa: empresa2
            });
            rolAdminEmpresa2 = await this.roleRepo.save(rolAdminEmpresa2);
            console.log('Rol AdminComercial creado con todos los permisos para la segunda empresa');
        } else {
            // Si el rol ya existe, asegurar que esté activo
            if (!rolAdminEmpresa2.estado) {
                rolAdminEmpresa2.estado = true;
                await this.roleRepo.save(rolAdminEmpresa2);
                console.log('Rol AdminComercial reactivado');
            }
            console.log('Rol AdminComercial ya existe y está activo');
        }

        // 16. ASOCIAR EL ROL AL USUARIO ADMINISTRADOR DE LA SEGUNDA EMPRESA
        adminEmpresa2.role = rolAdminEmpresa2;
        await this.userRepo.save(adminEmpresa2);
        console.log('Rol AdminComercial vinculado al usuario admin@comercial.com');

        // 17. CREAR USUARIO VENDEDOR PARA LA SEGUNDA EMPRESA
        let vendedorEmpresa2 = await this.userRepo.findOne({ where: { email: 'vendedor@comercial.com' } });
        if (!vendedorEmpresa2) {
            vendedorEmpresa2 = this.userRepo.create({
                nombre: 'María',
                apellido: 'Vendedora',
                email: 'vendedor@comercial.com',
                password: hashSync('vendedor123', 10),
                empresa: empresa2
            });
            vendedorEmpresa2 = await this.userRepo.save(vendedorEmpresa2);
            console.log('Usuario vendedor para Empresa Comercial S.A. creado');
        }

        // 18. CREAR ROL VENDEDOR PARA LA SEGUNDA EMPRESA
        let rolVendedorEmpresa2 = await this.roleRepo.findOne({ 
            where: { nombre: 'VendedorComercial', empresa_id: empresa2.id }, 
            relations: ['permissions'] 
        });
        if (!rolVendedorEmpresa2) {
            const permisosVendedor = await this.permisoRepo.find({
                where: [
                    // Permisos relacionados con ventas y productos
                    { codigo: 'producto_ver' },
                    { codigo: 'ventas_ver' },
                    { codigo: 'ventas_agregar' },
                    { codigo: 'ventas_modificar' },
                    { codigo: 'dashboard_ver' },
                    { codigo: 'sucursal_ver' },
                    { codigo: 'unidad_medida_ver' }, // Añadido para que puedan ver unidades de medida
                    // Puede ver usuarios pero no modificarlos
                    { codigo: 'usuario_ver'}
                ]
            });
            
            rolVendedorEmpresa2 = this.roleRepo.create({
                nombre: 'VendedorComercial',
                empresa_id: empresa2.id,
                estado: true,
                permissions: permisosVendedor,
                empresa: empresa2
            });
            rolVendedorEmpresa2 = await this.roleRepo.save(rolVendedorEmpresa2);
            console.log('Rol VendedorComercial creado con permisos de ventas y productos');
        } else {
            // Si el rol ya existe, asegurar que esté activo
            if (!rolVendedorEmpresa2.estado) {
                rolVendedorEmpresa2.estado = true;
                await this.roleRepo.save(rolVendedorEmpresa2);
                console.log('Rol VendedorComercial reactivado');
            }
            console.log('Rol VendedorComercial ya existe y está activo');
        }

        // 19. ASOCIAR EL ROL AL USUARIO VENDEDOR DE LA SEGUNDA EMPRESA
        vendedorEmpresa2.role = rolVendedorEmpresa2;
        await this.userRepo.save(vendedorEmpresa2);
        console.log('Rol VendedorComercial vinculado al usuario vendedor@comercial.com');
    }
}
