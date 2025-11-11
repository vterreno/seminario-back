import { Module } from '@nestjs/common';
import { DetalleVentaService } from './detalle-venta.service';
import { DetalleVentaController } from './detalle-venta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { detalleVentaEntity } from 'src/database/core/detalleVenta.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([detalleVentaEntity, ProductoEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [DetalleVentaController],
  providers: [DetalleVentaService],
  exports: [DetalleVentaService]
})
export class DetalleVentaModule {}
