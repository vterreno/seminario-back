import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { provinciaEntity } from 'src/database/core/provincia.entity';
import { ciudadEntity } from 'src/database/core/ciudad.entity';
import { UbicacionesService } from './ubicaciones.service';
import { UbicacionesController } from './ubicaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([provinciaEntity, ciudadEntity])],
  controllers: [UbicacionesController],
  providers: [UbicacionesService],
  exports: [UbicacionesService]
})
export class UbicacionesModule {}


