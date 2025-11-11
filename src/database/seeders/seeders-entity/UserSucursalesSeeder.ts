import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../core/user.entity';
import { sucursalEntity } from '../../core/sucursal.entity';
import { empresaEntity } from '../../core/empresa.entity';

@Injectable()
export class UserSucursalesSeeder {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,

        @InjectRepository(sucursalEntity)
        private readonly sucursalRepository: Repository<sucursalEntity>,

        @InjectRepository(empresaEntity)
        private readonly empresaRepository: Repository<empresaEntity>,
    ) {}

    async run() {
        console.log('🏪 Iniciando asignación de sucursales a usuarios...');

        // Obtener todas las sucursales
        const todasLasSucursales = await this.sucursalRepository.find({
            relations: ['empresa']
        });

        if (todasLasSucursales.length === 0) {
            console.log('⚠️  No hay sucursales disponibles, ejecuta primero el seeder de sucursales');
            return;
        }

        // Obtener todos los usuarios con sus relaciones
        const usuarios = await this.userRepository.find({
            relations: ['empresa', 'role', 'sucursales']
        });

        let totalAsignaciones = 0;

        for (const usuario of usuarios) {
            console.log(`\n   👤 Procesando usuario: ${usuario.email}`);

            // Determinar qué sucursales asignar según el rol y empresa
            const sucursalesAAsignar = await this.determinarSucursalesParaUsuario(usuario, todasLasSucursales);

            if (sucursalesAAsignar.length > 0) {
                // Asignar las sucursales al usuario
                usuario.sucursales = sucursalesAAsignar;
                await this.userRepository.save(usuario);
                
                totalAsignaciones++;
                console.log(`      ✅ Asignadas ${sucursalesAAsignar.length} sucursales:`);
                sucursalesAAsignar.forEach(sucursal => {
                    console.log(`         📍 ${sucursal.nombre} (${sucursal.codigo})`);
                });
            } else {
                console.log(`      ℹ️  No se asignaron sucursales`);
            }
        }

        console.log(`\n   🎉 Asignación de sucursales completada:`);
        console.log(`      📊 Total usuarios procesados: ${usuarios.length}`);
        console.log(`      🔄 Total asignaciones realizadas: ${totalAsignaciones}`);
    }

    private async determinarSucursalesParaUsuario(
        usuario: UserEntity, 
        todasLasSucursales: sucursalEntity[]
    ): Promise<sucursalEntity[]> {
        
        // Superadmin - NO se le asignan sucursales (acceso total sin restricciones)
        if (usuario.role?.nombre === 'Superadmin') {
            console.log(`      👑 Superadmin - Sin sucursales asignadas (acceso total al sistema)`);
            return [];
        }

        // Si el usuario no tiene empresa, no se asignan sucursales
        if (!usuario.empresa) {
            console.log(`      ⚠️  Usuario sin empresa - Sin sucursales`);
            return [];
        }

        // Filtrar sucursales por empresa del usuario
        const sucursalesDeLaEmpresa = todasLasSucursales.filter(
            sucursal => sucursal.empresa_id === usuario.empresa.id
        );

        // Admin de empresa - Todas las sucursales de su empresa
        if (usuario.role?.nombre === 'Administrador') {
            console.log(`      🏢 Admin de ${usuario.empresa.name} - Todas las sucursales de la empresa`);
            return sucursalesDeLaEmpresa;
        }

        // Usuario limitado de TechCorp - Solo una sucursal
        if (usuario.empresa.name === 'TechCorp S.A.' && usuario.role?.nombre === 'Usuario') {
            console.log(`      📋 Usuario limitado de TechCorp - Una sucursal`);
            
            // Tomar la primera sucursal activa de TechCorp
            const sucursalUnica = sucursalesDeLaEmpresa
                .filter(sucursal => sucursal.estado)
                .slice(0, 1); // Solo la primera
            
            if (sucursalUnica.length > 0) {
                return sucursalUnica;
            }
        }

        // Para otros casos (usuarios normales de otras empresas), no asignar sucursales por defecto
        console.log(`      ℹ️  Rol/Empresa sin asignación específica - Sin sucursales`);
        return [];
    }
}