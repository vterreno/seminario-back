// src/database/seeders/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSeeder } from './seeders-entity/role.seeder';
import { RoleEntity } from '../core/roles.entity';
import { PermissionEntity } from '../core/permission.entity';
import { UserEntity } from '../core/user.entity';
import { SeederService } from './seeder.service';
import { PermisosSeeder } from './seeders-entity/permisos.seeder';
import { UserSeeder } from './seeders-entity/users.seeder';
import { EmpresaSeeder } from './seeders-entity/empresa.seeder';
import { empresaEntity } from '../core/empresa.entity';
import { MarcaEntity } from '../core/marcas.entity';
import { ProductoEntity } from '../core/producto.entity';
import { ProductoSimpleSeeder } from './seeders-entity/producto-simple.seeder';
import { MovimientosStockInicialSeeder } from './seeders-entity/movimientos-stock-inicial.seeder';
import { MovimientoStockEntity } from '../core/movimientos-stock.entity';
import { ConsumidorFinalSeeder } from './seeders-entity/consumidor-final.seeder';
import SucursalesSeeder from './seeders-entity/sucursales.seeder';
import { contactoEntity } from '../core/contacto.entity';
import { sucursalEntity } from '../core/sucursal.entity';
import { VentaSeeder } from './seeders-entity/venta.seeder';
import { ventaEntity } from '../core/venta.entity';
import { detalleVentaEntity } from '../core/detalleVenta.entity';
import { pagoEntity } from '../core/pago.entity';
import { EmpresaUsuarioRolSeeder } from './seeders-entity/empresa-usuario-rol.seeder';
import { MasterSeeder } from './seeders-entity/master.seeder';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            RoleEntity, 
            PermissionEntity, 
            UserEntity, 
            empresaEntity, 
            MarcaEntity, 
            ProductoEntity, 
            MovimientoStockEntity, 
            contactoEntity, 
            sucursalEntity,
            ventaEntity,
            detalleVentaEntity,
            pagoEntity,
        ]),
    ],
    providers: [
        // Seeders principales
        PermisosSeeder,
        EmpresaSeeder,
        RoleSeeder,
        UserSeeder,
        SucursalesSeeder,
        ConsumidorFinalSeeder,
        // Seeders simplificados
        ProductoSimpleSeeder,
        EmpresaUsuarioRolSeeder,
        MovimientosStockInicialSeeder,
        VentaSeeder,
        // Seeder maestro
        MasterSeeder,
        SeederService,
    ],
    exports: [SeederService],
})
export class SeedModule {}