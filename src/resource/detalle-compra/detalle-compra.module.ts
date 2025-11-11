import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleCompraService } from './detalle-compra.service';
import { DetalleCompraController } from './detalle-compra.controller';
import { DetalleCompraEntity } from 'src/database/core/detalleCompra.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetalleCompraEntity, ProductoEntity]),
  ],
  controllers: [DetalleCompraController],
  providers: [DetalleCompraService],
  exports: [DetalleCompraService],
})
export class DetalleCompraModule {}
