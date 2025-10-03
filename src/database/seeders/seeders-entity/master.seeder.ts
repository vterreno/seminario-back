import { Injectable } from '@nestjs/common';
import { PermisosSeeder } from './permisos.seeder';
import { EmpresaSeeder } from './empresa.seeder';
import { RoleSeeder } from './role.seeder';
import { UserSeeder } from './users.seeder';
import { EmpresaUsuarioRolSimpleSeeder } from './empresa-usuario-rol-simple.seeder';
import { MarcaSimpleSeeder } from './marca-simple.seeder';
import { ConsumidorFinalSeeder } from './consumidor-final.seeder'; 
import { ProductoSimpleSeeder } from './producto-simple.seeder';
import { MovimientosStockInicialSeeder } from './movimientos-stock-inicial.seeder';
import { ListaPreciosSeeder } from './lista-precios.seeder';


@Injectable()
export class MasterSeeder {
    constructor(
        private readonly permisosSeeder: PermisosSeeder,
        private readonly empresaSeeder: EmpresaSeeder,
        private readonly roleSeeder: RoleSeeder,
        private readonly userSeeder: UserSeeder,
        private readonly empresaUsuarioRolSimpleSeeder: EmpresaUsuarioRolSimpleSeeder,
        private readonly marcaSimpleSeeder: MarcaSimpleSeeder,
        private readonly consumidorFinalSeeder: ConsumidorFinalSeeder,
        private readonly productoSimpleSeeder: ProductoSimpleSeeder,
        private readonly movimientosStockInicialSeeder: MovimientosStockInicialSeeder,
        private readonly listaPreciosSeeder: ListaPreciosSeeder,
    ) {}

    async run() {
        console.log('🌟 INICIANDO SEED COMPLETO DEL SISTEMA');
        console.log('=====================================\n');

        try {
            // 1. Permisos (base del sistema)
            console.log('📋 1/7 - Creando permisos...');
            await this.permisosSeeder.run();
            console.log('✅ Permisos completados\n');

            // 2. Empresas
            console.log('🏢 2/7 - Creando empresas...');
            await this.empresaSeeder.run();
            console.log('✅ Empresas completadas\n');

            // 3. Consumidor Final
            console.log('🧾 3/7 - Creando consumidores finales por empresa...');
            await this.consumidorFinalSeeder.run();
            console.log('✅ Consumidores finales completados\n');

            // 4. Rol Superadmin (necesario para el superusuario)
            console.log('👑 4/7 - Creando rol superadmin...');
            await this.roleSeeder.run();
            console.log('✅ Rol superadmin completado\n');

            // 5. Usuario Superadmin inicial
            console.log('👤 5/7 - Creando usuario superadmin inicial...');
            await this.userSeeder.run();
            console.log('✅ Usuario superadmin completado\n');

            // 6. Usuarios y roles por empresa
            console.log('👥 6/7 - Creando usuarios y roles por empresa...');
            await this.empresaUsuarioRolSimpleSeeder.run();
            console.log('✅ Usuarios y roles por empresa completados\n');

            // 7. Marcas por empresa
            console.log('🏷️ 7/7 - Creando marcas por empresa...');
            await this.marcaSimpleSeeder.run();
            console.log('✅ Marcas completadas\n');

            // 7. Productos por empresa y marca
            console.log('📦 7/8 - Creando productos por empresa y marca...');
            await this.productoSimpleSeeder.run();
            console.log('✅ Productos completados\n');

            
            await this.listaPreciosSeeder.run();
            console.log('✅ Listas de precios completadas\n');
            // 8. Movimientos de stock iniciales
            console.log('📊 8/8 - Creando movimientos de stock iniciales...');
            await this.movimientosStockInicialSeeder.run();
            console.log('✅ Movimientos de stock completados\n');

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
            
            console.log('\n🏢 EMPRESAS, MARCAS Y PRODUCTOS:');
            console.log('• TechCorp S.A.: Apple, Samsung, Sony, LG, HP');
            console.log('  - Productos: iPhone 15 Pro, MacBook Air M2, Galaxy S24, PlayStation 5, etc.');
            console.log('• FoodMarket Ltda.: Coca Cola, Nestlé, Unilever, Danone, Kelloggs');
            console.log('  - Productos: Coca Cola 2.5L, Nestlé Nescafé, Dove Jabón, Yogurt Natural, etc.');
            
        } catch (error) {
            console.error('❌ Error durante el seed:', error);
            throw error;
        }
    }
}
