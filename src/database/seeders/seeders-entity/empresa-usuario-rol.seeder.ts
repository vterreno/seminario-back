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
        // 3. Crear rol con todos los permisos asociado a la empresa
        let rol = await this.roleRepo.findOne({ where: { nombre: 'AdminPrueba', empresa_id: empresa.id }, relations: ['permissions'] });
        if (!rol) {
            const permisos = await this.permisoRepo.find();
            rol = this.roleRepo.create({
                nombre: 'AdminPrueba',
                empresa_id: empresa.id,
                estado: true,
                permissions: permisos,
                empresa: empresa
            });
            rol = await this.roleRepo.save(rol);
            console.log('Rol de prueba creado con todos los permisos');
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
                    { codigo: 'producto_ver' },
                    { codigo: 'ventas_ver' },
                    { codigo: 'compras_ver' }
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

        // 8. ROL GESTOR DE PRODUCTOS
        let rolGestor = await this.roleRepo.findOne({ 
            where: { nombre: 'GestorPrueba', empresa_id: empresa.id }, 
            relations: ['permissions'] 
        });
        if (!rolGestor) {
            const permisosGestor = await this.permisoRepo.find({
                where: [
                    { codigo: 'producto_ver' },
                    { codigo: 'producto_agregar' },
                    { codigo: 'producto_modificar' },
                    { codigo: 'producto_eliminar' },
                    { codigo: 'ventas_ver' },
                    { codigo: 'compras_ver' }
                ]
            });
            
            rolGestor = this.roleRepo.create({
                nombre: 'GestorPrueba',
                empresa_id: empresa.id,
                estado: true,
                permissions: permisosGestor,
                empresa: empresa
            });
            rolGestor = await this.roleRepo.save(rolGestor);
            console.log('Rol GestorPrueba creado con gestión completa de productos + lectura ventas/compras');
        }

        // 9. Asociar roles a los nuevos usuarios
        usuarioOperador.role = rolOperador;
        await this.userRepo.save(usuarioOperador);
        console.log('Rol OperadorPrueba vinculado al usuario operador@test.com');

        usuarioGestor.role = rolGestor;
        await this.userRepo.save(usuarioGestor);
        console.log('Rol GestorPrueba vinculado al usuario gestor@test.com');
    }
}
