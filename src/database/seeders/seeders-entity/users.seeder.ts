import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../core/user.entity';
import { RoleEntity } from '../../core/roles.entity';
import { hashSync } from 'bcrypt';

@Injectable()
export class UserSeeder {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        @InjectRepository(RoleEntity)
        private readonly roleRepository: Repository<RoleEntity>,
    ) {}

    async run() {
        const usuarios = [
        { email: 'prueba@prueba.com', password: '123456', roleName: 'admin' },
        ];

        const totalUsuarios = await this.userRepository.count();
        if (totalUsuarios === 0) {
        for (const usuario of usuarios) {
            const role = await this.roleRepository.findOne({ where: { name: usuario.roleName } });
            if (!role) {
            console.error(`No se encontró el rol ${usuario.roleName}`);
            continue;
            }

            const newUser = new UserEntity();
            newUser.email = usuario.email;
            newUser.password = hashSync(usuario.password, 10);
            newUser.role = role;

            await this.userRepository.save(newUser);
        }
        console.log('Usuarios creados desde el seeder');
        } else {
        console.log('Ya existen usuarios, no se crea ninguno');
        }
    }
}
