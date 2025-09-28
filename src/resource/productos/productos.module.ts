import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from 'src/database/core/producto.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductoEntity]),
    JwtModule,
    UsersModule,
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService]
})
export class ProductosModule {}
