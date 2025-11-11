import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoEntity, MovimientoStockEntity, sucursalEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService]
})
export class ProductosModule {}
