import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesMedidaService } from './unidades-medida.service';
import { UnidadesMedidaController } from './unidades-medida.controller';
import { UnidadMedida } from '../../database/core/unidad-medida.entity';
import { JwtModule } from 'src/jwt/jwt.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UnidadMedida]),
    JwtModule,
    UsersModule
  ],
  controllers: [UnidadesMedidaController],
  providers: [UnidadesMedidaService],
  exports: [UnidadesMedidaService],
})
export class UnidadesMedidaModule {}