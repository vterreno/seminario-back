import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'
import { ventaEntity } from 'src/database/core/venta.entity'
import { CompraEntity } from 'src/database/core/compra.entity'
import { UserEntity } from 'src/database/core/user.entity'
import { ProductoEntity } from 'src/database/core/producto.entity'
import { contactoEntity } from 'src/database/core/contacto.entity'
import { sucursalEntity } from 'src/database/core/sucursal.entity'
import { empresaEntity } from 'src/database/core/empresa.entity'
import { detalleVentaEntity } from 'src/database/core/detalleVenta.entity'
import { JwtModule } from 'src/jwt/jwt.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ventaEntity,
      CompraEntity,
      UserEntity,
      ProductoEntity,
      contactoEntity,
      sucursalEntity,
      empresaEntity,
      detalleVentaEntity,
    ]),
    JwtModule,
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
