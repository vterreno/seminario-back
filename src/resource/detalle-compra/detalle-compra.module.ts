import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleCompraService } from './detalle-compra.service';
import { DetalleCompraController } from './detalle-compra.controller';
import { DetalleCompraEntity } from 'src/database/core/detalleCompra.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetalleCompraEntity, ProductoEntity, ProductoProveedorEntity]),
  ],
  controllers: [DetalleCompraController],
  providers: [DetalleCompraService],
  exports: [DetalleCompraService],
})
export class DetalleCompraModule {}
