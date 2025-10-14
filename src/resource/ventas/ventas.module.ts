import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ventaEntity } from 'src/database/core/venta.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';
import { PagoModule } from '../pago/pago.module';
import { DetalleVentaModule } from '../detalle-venta/detalle-venta.module';
import { MovimientosStockModule } from '../movimientos-stock/movimientos-stock.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([ventaEntity, sucursalEntity]),
      JwtModule,
      UsersModule,
      PagoModule,
      DetalleVentaModule,
      MovimientosStockModule,
    ],
  controllers: [VentasController],
  providers: [VentasService],
  exports: [VentasService]
})
export class VentasModule {}
