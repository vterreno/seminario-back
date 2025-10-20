import { Injectable } from '@nestjs/common';
import { PermisosSeeder } from './permisos.seeder';
import { EmpresaSeeder } from './empresa.seeder';
import { RoleSeeder } from './role.seeder';
import { UserSeeder } from './users.seeder';
import { EmpresaUsuarioRolSeeder } from './empresa-usuario-rol.seeder';
import { MarcaSeeder } from './marca.seeder';
import { ConsumidorFinalSeeder } from './consumidor-final.seeder';
import { ProductoSimpleSeeder } from './producto-simple.seeder';
import { MovimientosStockInicialSeeder } from './movimientos-stock-inicial.seeder';
import { VentaSeeder } from './venta.seeder';
import SucursalesSeeder from './sucursales.seeder';


@Injectable()
export class MasterSeeder {
    constructor(
        private readonly permisosSeeder: PermisosSeeder,
        private readonly empresaSeeder: EmpresaSeeder,
        private readonly sucursalesSeeder: SucursalesSeeder,
        private readonly roleSeeder: RoleSeeder,
        private readonly userSeeder: UserSeeder,
        private readonly empresaUsuarioRolSeeder: EmpresaUsuarioRolSeeder,
        private readonly marcaSeeder: MarcaSeeder,
        private readonly consumidorFinalSeeder: ConsumidorFinalSeeder,
        private readonly productoSeeder: ProductoSimpleSeeder,
        private readonly movimientosStockInicialSeeder: MovimientosStockInicialSeeder,
        private readonly ventaSeeder: VentaSeeder,
    ) {}

    async run() {
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║  🌟 INICIANDO SEED COMPLETO DEL SISTEMA MATEPYME 🌟  ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');

        const startTime = Date.now();

        try {
            // 1. Permisos (base del sistema)
            console.log('📋 1/7 - Creando permisos...');
            await this.permisosSeeder.run();
            console.log('✅ Permisos completados\n');

            // 2. Empresas
            console.log('🏢 2/7 - Creando empresas...');
            await this.empresaSeeder.run();
            console.log('✅ Empresas completadas\n');

            // 2. Sucursales
            console.log('🏢 2/7 - Creando sucursales...');
            await this.sucursalesSeeder.run();
            console.log('✅ Sucursales completadas\n');

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

            // 3️⃣  Consumidores finales (uno por empresa)
            await this.ejecutarPaso(3, 8, 'Consumidores finales', () => this.consumidorFinalSeeder.run());

            // 4️⃣  Rol Superadmin (necesario para usuario superadmin)
            await this.ejecutarPaso(4, 8, 'Rol Superadmin', () => this.roleSeeder.run());

            // 5️⃣  Usuario Superadmin inicial
            await this.ejecutarPaso(5, 8, 'Usuario Superadmin', () => this.userSeeder.run());

            // 6️⃣  Usuarios y roles por empresa
            await this.ejecutarPaso(6, 8, 'Usuarios y roles por empresa', () => this.empresaUsuarioRolSeeder.run());
            // 6. Usuarios y roles por empresa
            console.log('👥 6/7 - Creando usuarios y roles por empresa...');
            await this.empresaUsuarioRolSeeder.run();
            console.log('✅ Usuarios y roles por empresa completados\n');
            
            // 8. Unidades de medida por empresa
            console.log('⚖️ 8/8 - Creando unidades de medida por empresa...');
            await this.unidadesMedidaSeeder.run();
            console.log('✅ Unidades de medida completadas\n');

            // 7️⃣  Marcas por empresa
            await this.ejecutarPaso(7, 8, 'Marcas', () => this.marcaSeeder.run());

            // 8️⃣  Productos por empresa y marca
            await this.ejecutarPaso(8, 8, 'Productos', () => this.productoSeeder.run());
            console.log('✅ Categorías completadas\n');

            // 7. Productos por empresa y marca
            console.log('📦 7/8 - Creando productos por empresa y marca...');
            await this.productoSimpleSeeder.run();
            console.log('✅ Productos completados\n');

            // 8. Movimientos de stock iniciales
            console.log('📊 8/9 - Creando movimientos de stock iniciales...');
            await this.movimientosStockInicialSeeder.run();
            console.log('✅ Movimientos de stock completados\n');

            // 9. Ventas con detalles
            console.log('💰 9/9 - Creando ventas con múltiples detalles...');
            await this.ventaSeeder.run();
            console.log('✅ Ventas completadas\n');

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
            console.error('\n❌ ERROR DURANTE EL SEED:', error.message);
            console.error(error.stack);
            throw error;
        }
    }

    private async ejecutarPaso(
        paso: number,
        total: number,
        nombre: string,
        fn: () => Promise<void>
    ): Promise<void> {
        console.log(`\n┌${'─'.repeat(55)}┐`);
        console.log(`│ ${paso}/${total} - ${nombre.padEnd(50)}│`);
        console.log(`└${'─'.repeat(55)}┘`);
        
        await fn();
        
        console.log(`   ✅ ${nombre} completado`);
    }

    private mostrarResumenFinal(duration: string): void {
        console.log('\n\n╔═══════════════════════════════════════════════════════╗');
        console.log('║          🎉 SEED COMPLETADO EXITOSAMENTE 🎉          ║');
        console.log('╚═══════════════════════════════════════════════════════╝');
        
        console.log(`\n⏱️  Tiempo de ejecución: ${duration}s`);
        
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║              📚 USUARIOS DE PRUEBA                    ║');
        console.log('╚═══════════════════════════════════════════════════════╝');
        console.log('\n┌─────────────────────────────────────┬─────────────┬─────────────────────────┐');
        console.log('│ EMAIL                               │ PASSWORD    │ DESCRIPCIÓN             │');
        console.log('├─────────────────────────────────────┼─────────────┼─────────────────────────┤');
        console.log('│ superadmin@sistema.com              │ super123    │ Superadmin (sin empresa)│');
        console.log('│ admin@techcorp.com                  │ tech123     │ Admin TechCorp S.A.     │');
        console.log('│ usuario@techcorp.com                │ user123     │ Usuario TechCorp        │');
        console.log('│ admin@foodmarket.com                │ food123     │ Admin FoodMarket Ltda.  │');
        console.log('└─────────────────────────────────────┴─────────────┴─────────────────────────┘');
        
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║           🏢 ESTRUCTURA DE DATOS CREADA               ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');
        
        console.log('🏢 TechCorp S.A.:');
        console.log('   Marcas: Apple, Samsung, Sony, LG, HP');
        console.log('   Productos: iPhone 15 Pro, MacBook Air M2, Galaxy S24, etc.');
        
        console.log('\n🏢 FoodMarket Ltda.:');
        console.log('   Marcas: Coca Cola, Nestlé, Unilever, Danone, Kelloggs');
        console.log('   Productos: Coca Cola 2.5L, Nescafé, Dove, Yogurt, etc.');
        
        console.log('\n' + '═'.repeat(57));
        console.log('Sistema listo para usar! 🚀');
        console.log('═'.repeat(57) + '\n');
    }
}
