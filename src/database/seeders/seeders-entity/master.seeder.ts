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
import { UnidadMedidaSeeder } from './unidad-medida.seeder';
import { CategoriaSimpleSeeder } from './categoria.seeder';
import { ListaPreciosSeeder } from './lista-precios.seeder';
import { UserSucursalesSeeder } from './UserSucursalesSeeder';
import { ProductoProveedorSeeder } from './producto-proveedor.seeder';
import { CompraSeeder } from './compra.seeder';

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
        private readonly categoriaSeeder: CategoriaSimpleSeeder,
        private readonly consumidorFinalSeeder: ConsumidorFinalSeeder,
        private readonly productoSeeder: ProductoSimpleSeeder,
        private readonly movimientosStockInicialSeeder: MovimientosStockInicialSeeder,
        private readonly ventaSeeder: VentaSeeder,
        private readonly unidadesMedidaSeeder: UnidadMedidaSeeder,
        private readonly listaPreciosSeeder: ListaPreciosSeeder,
        private readonly userSucursalesSeeder: UserSucursalesSeeder,
        private readonly productoProveedorSeeder: ProductoProveedorSeeder,
        private readonly compraSeeder: CompraSeeder,
    ) {}

    async run() {
        console.log('\n╔═══════════════════════════════════════════════════════╗');
        console.log('║  🌟 INICIANDO SEED COMPLETO DEL SISTEMA MATEPYME 🌟  ║');
        console.log('╚═══════════════════════════════════════════════════════╝\n');

        const startTime = Date.now();

        try {
            // 1. Permisos (base del sistema)
            await this.ejecutarPaso(1, 13, 'Permisos', () => this.permisosSeeder.run());

            // 2. Empresas
            await this.ejecutarPaso(2, 13, 'Empresas', () => this.empresaSeeder.run());

            // 3. Sucursales
            await this.ejecutarPaso(3, 13, 'Sucursales', () => this.sucursalesSeeder.run());

            // 4. Consumidores finales (uno por empresa)
            await this.ejecutarPaso(4, 13, 'Consumidores finales', () => this.consumidorFinalSeeder.run());

            // 5. Rol Superadmin (necesario para usuario superadmin)
            await this.ejecutarPaso(5, 13, 'Rol Superadmin', () => this.roleSeeder.run());

            // 6. Usuario Superadmin inicial
            await this.ejecutarPaso(6, 13, 'Usuario Superadmin', () => this.userSeeder.run());

            // 7. Usuarios y roles por empresa
            await this.ejecutarPaso(7, 13, 'Usuarios y roles por empresa', () => this.empresaUsuarioRolSeeder.run());

            // 8. Asignación de sucursales a usuarios
            await this.ejecutarPaso(8, 14, 'Asignación de sucursales a usuarios', () => this.userSucursalesSeeder.run());
            
            // 8. Marcas por empresa
            await this.ejecutarPaso(8, 13, 'Marcas', () => this.marcaSeeder.run());

            // 9. Categorías por empresa
            await this.ejecutarPaso(9, 13, 'Categorías', () => this.categoriaSeeder.run());

            // 10. Unidades de medida por sucursal
            await this.ejecutarPaso(10, 13, 'Unidades de medida', () => this.unidadesMedidaSeeder.run());

            // 11. Productos por sucursal y marca
            await this.ejecutarPaso(11, 15, 'Productos', () => this.productoSeeder.run());

            // 12. Productos por proveedor
            await this.ejecutarPaso(12, 16, 'Productos por proveedor', () => this.productoProveedorSeeder.run());

            // 13. Compras con detalles y movimientos de stock
            await this.ejecutarPaso(13, 16, 'Compras', () => this.compraSeeder.run());

            // 14. Listas de precios por empresa
            await this.ejecutarPaso(14, 16, 'Listas de precios', () => this.listaPreciosSeeder.run());

            // 15. Movimientos de stock iniciales
            await this.ejecutarPaso(15, 16, 'Movimientos de stock iniciales', () => this.movimientosStockInicialSeeder.run());

            // 16. Ventas con detalles
            await this.ejecutarPaso(16, 16, 'Ventas', () => this.ventaSeeder.run());

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
        console.log('   Listas de precios: Lista TechCorp 2025');
        
        console.log('\n🏢 FoodMarket Ltda.:');
        console.log('   Marcas: Coca Cola, Nestlé, Unilever, Danone, Kelloggs');
        console.log('   Productos: Coca Cola 2.5L, Nescafé, Dove, Yogurt, etc.');
        console.log('   Listas de precios: Lista FoodMarket 2025');
        
        console.log('\n' + '═'.repeat(57));
        console.log('Sistema listo para usar! 🚀');
        console.log('═'.repeat(57) + '\n');
    }
}