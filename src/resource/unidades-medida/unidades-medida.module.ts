import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnidadesMedidaService } from './unidades-medida.service';
import { UnidadesMedidaController } from './unidades-medida.controller';
import { UnidadMedida } from '../../database/core/unidad-medida.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMedida])],
  controllers: [UnidadesMedidaController],
  providers: [UnidadesMedidaService],
  exports: [UnidadesMedidaService],
})
export class UnidadesMedidaModule {}