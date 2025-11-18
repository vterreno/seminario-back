import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostoAdicionalService } from './costo-adicional.service';
import { CostoAdicionalEntity } from 'src/database/core/costo-adicionales.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CostoAdicionalEntity])],
  providers: [CostoAdicionalService],
  exports: [CostoAdicionalService],
})
export class CostoAdicionalModule {}
