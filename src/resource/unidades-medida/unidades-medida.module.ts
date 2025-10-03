import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesMedidaService } from './unidades-medida.service';
import { UnidadesMedidaController } from './unidades-medida.controller';
import { UnidadMedidaEntity } from '../../database/core/unidad-medida.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';
import { ProductoEntity } from 'src/database/core/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnidadMedidaEntity, ProductoEntity]),
    JwtModule,
    UsersModule
  ],
  controllers: [UnidadesMedidaController],
  providers: [UnidadesMedidaService],
  exports: [UnidadesMedidaService],
})
export class UnidadesMedidaModule {}