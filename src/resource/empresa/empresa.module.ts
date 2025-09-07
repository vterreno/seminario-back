import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { empresaEntity } from '../../database/core/empresa.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { UserEntity } from 'src/database/core/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([empresaEntity, sucursalEntity, UserEntity])],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService],
})
export class EmpresaModule {}
