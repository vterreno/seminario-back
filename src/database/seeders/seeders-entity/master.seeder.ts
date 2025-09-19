import { Injectable } from '@nestjs/common';
import { PermisosSeeder } from './permisos.seeder';
import { EmpresaSeeder } from './empresa.seeder';
import { RoleSeeder } from './role.seeder';
import { UserSeeder } from './users.seeder';
import { EmpresaUsuarioRolSimpleSeeder } from './empresa-usuario-rol-simple.seeder';
import { MarcaSimpleSeeder } from './marca-simple.seeder';

@Injectable()
export class MasterSeeder {
    constructor(
        private readonly permisosSeeder: PermisosSeeder,
        private readonly empresaSeeder: EmpresaSeeder,
        private readonly roleSeeder: RoleSeeder,
        private readonly userSeeder: UserSeeder,
        private readonly empresaUsuarioRolSimpleSeeder: EmpresaUsuarioRolSimpleSeeder,
        private readonly marcaSimpleSeeder: MarcaSimpleSeeder,
    ) {}

    async run() {
        console.log('🌟 INICIANDO SEED COMPLETO DEL SISTEMA');
        console.log('=====================================\n');

        try {
            // 1. Permisos (base del sistema)
            console.log('📋 1/6 - Creando permisos...');
            await this.permisosSeeder.run();
            console.log('✅ Permisos completados\n');

            // 2. Empresas
            console.log('🏢 2/6 - Creando empresas...');
            await this.empresaSeeder.run();
            console.log('✅ Empresas completadas\n');

            // 3. Rol Superadmin (necesario para el superusuario)
            console.log('👑 3/6 - Creando rol superadmin...');
            await this.roleSeeder.run();
            console.log('✅ Rol superadmin completado\n');

            // 4. Usuario Superadmin inicial
            console.log('👤 4/6 - Creando usuario superadmin inicial...');
            await this.userSeeder.run();
            console.log('✅ Usuario superadmin completado\n');

            // 5. Usuarios y roles por empresa
            console.log('👥 5/6 - Creando usuarios y roles por empresa...');
            await this.empresaUsuarioRolSimpleSeeder.run();
            console.log('✅ Usuarios y roles por empresa completados\n');

            // 6. Marcas por empresa
            console.log('🏷️ 6/6 - Creando marcas por empresa...');
            await this.marcaSimpleSeeder.run();
            console.log('✅ Marcas completadas\n');

            console.log('🎉 SEED COMPLETO FINALIZADO EXITOSAMENTE');
            console.log('=========================================');
            console.log('\n📚 USUARIOS DE PRUEBA DISPONIBLES:');
            console.log('┌─────────────────────────────────────┬─────────────┬─────────────────────┐');
            console.log('│ EMAIL                               │ PASSWORD    │ DESCRIPCIÓN         │');
            console.log('├─────────────────────────────────────┼─────────────┼─────────────────────┤');
            console.log('│ superadmin@sistema.com              │ super123    │ Superadmin (sin empresa)│');
            console.log('│ admin@techcorp.com                  │ tech123     │ Admin TechCorp      │');
            console.log('│ usuario@techcorp.com                │ user123     │ Usuario TechCorp    │');
            console.log('│ admin@foodmarket.com                │ food123     │ Admin FoodMarket    │');
            console.log('└─────────────────────────────────────┴─────────────┴─────────────────────┘');
            
            console.log('\n🏢 EMPRESAS Y SUS MARCAS:');
            console.log('• TechCorp S.A.: Apple, Samsung, Sony, LG, HP');
            console.log('• FoodMarket Ltda.: Coca Cola, Nestlé, Unilever, Danone, Kelloggs');
            
        } catch (error) {
            console.error('❌ Error durante el seed:', error);
            throw error;
        }
    }
}
