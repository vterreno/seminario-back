import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SucursalesService } from './sucursales.service';
import { SucursalesController } from './sucursales.controller';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { EmpresaModule } from '../empresa/empresa.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([sucursalEntity]),
    EmpresaModule
  ],
  controllers: [SucursalesController],
  providers: [SucursalesService],
  exports: [SucursalesService]
})
export class SucursalesModule {}
