import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComprasService } from './compras.service';
import { ComprasController } from './compras.controller';
import { CompraEntity } from 'src/database/core/compra.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { DetalleCompraModule } from '../detalle-compra/detalle-compra.module';
import { MovimientosStockModule } from '../movimientos-stock/movimientos-stock.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { PagoModule } from '../pago/pago.module';
import { ProductosModule } from '../productos/productos.module';
import { ProductoProveedorModule } from '../producto-proveedor/producto-proveedor.module';
import { CostoAdicionalEntity } from 'src/database/core/costo-adicionales.entity';
import { CostoAdicionalModule } from '../costo-adicional/costo-adicional.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompraEntity, sucursalEntity, ProductoProveedorEntity, ProductoEntity, CostoAdicionalEntity]),
    DetalleCompraModule,
    MovimientosStockModule,
    PagoModule,
    ProductosModule,
    ProductoProveedorModule,
    CostoAdicionalModule,
    JwtModule,
    UsersModule
  ],
  controllers: [ComprasController],
  providers: [ComprasService],
  exports: [ComprasService],
})
export class ComprasModule {}
