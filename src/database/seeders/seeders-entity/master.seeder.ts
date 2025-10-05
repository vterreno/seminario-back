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
import { ListaPreciosSeeder } from './lista-precios.seeder';

@Injectable()
export class MasterSeeder {
    constructor(
        private readonly permisosSeeder: PermisosSeeder,
        private readonly empresaSeeder: EmpresaSeeder,
        private readonly roleSeeder: RoleSeeder,
        private readonly userSeeder: UserSeeder,
        private readonly empresaUsuarioRolSeeder: EmpresaUsuarioRolSeeder,
        private readonly marcaSeeder: MarcaSeeder,
        private readonly consumidorFinalSeeder: ConsumidorFinalSeeder,
        private readonly productoSeeder: ProductoSimpleSeeder,
        private readonly movimientosStockInicialSeeder: MovimientosStockInicialSeeder,
        private readonly listaPreciosSeeder: ListaPreciosSeeder,
    ) {}

    async run() {
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║  🌟 INICIANDO SEED COMPLETO DEL SISTEMA MATEPYME 🌟  ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');

        const startTime = Date.now();

        try {
            // 1️⃣  Permisos (base del sistema de autorización)
            await this.ejecutarPaso(1, 8, 'Permisos del sistema', () => this.permisosSeeder.run());

            // 2️⃣  Empresas (organizaciones del sistema)
            await this.ejecutarPaso(2, 8, 'Empresas', () => this.empresaSeeder.run());

            // 3️⃣  Consumidores finales (uno por empresa)
            await this.ejecutarPaso(3, 8, 'Consumidores finales', () => this.consumidorFinalSeeder.run());

            // 4️⃣  Rol Superadmin (necesario para usuario superadmin)
            await this.ejecutarPaso(4, 8, 'Rol Superadmin', () => this.roleSeeder.run());

            // 5️⃣  Usuario Superadmin inicial
            await this.ejecutarPaso(5, 8, 'Usuario Superadmin', () => this.userSeeder.run());

            // 6️⃣  Usuarios y roles por empresa
            await this.ejecutarPaso(6, 8, 'Usuarios y roles por empresa', () => this.empresaUsuarioRolSeeder.run());

            // 7️⃣  Marcas por empresa
            await this.ejecutarPaso(7, 8, 'Marcas', () => this.marcaSeeder.run());

            // 8️⃣  Productos por empresa y marca
            await this.ejecutarPaso(8, 8, 'Productos', () => this.productoSeeder.run());

            // 9️⃣  Listas de precios
            console.log('\n📋 Paso opcional - Listas de precios...');
            await this.listaPreciosSeeder.run();

            // 🔟 Movimientos de stock iniciales
            console.log('\n📊 Paso opcional - Movimientos de stock...');
            await this.movimientosStockInicialSeeder.run();

            const endTime = Date.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            this.mostrarResumenFinal(duration);

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
