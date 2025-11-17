import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoProveedorService } from './producto-proveedor.service';
import { ProductoProveedorController } from './producto-proveedor.controller';
import { ProductoProveedorEntity } from 'src/database/core/producto-proveedor.entity';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoProveedorEntity, ProductoEntity, contactoEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [ProductoProveedorController],
  providers: [ProductoProveedorService],
  exports: [ProductoProveedorService],
})
export class ProductoProveedorModule {}
