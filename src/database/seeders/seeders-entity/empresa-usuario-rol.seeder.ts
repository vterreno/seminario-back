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
        let usuario = await this.userRepo.findOne({ where: { email: 'prueba@mail.com' } });
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
    }
}
