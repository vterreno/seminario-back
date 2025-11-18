import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCostoAdicionalDto } from './dto/create-costo-adicional.dto';
import { CostoAdicionalEntity } from 'src/database/core/costo-adicionales.entity';

@Injectable()
export class CostoAdicionalService {
  constructor(
    @InjectRepository(CostoAdicionalEntity)
    private costoAdicionalRepository: Repository<CostoAdicionalEntity>,
  ) {}

  async createCostoAdicional(costoAdicionalData: CreateCostoAdicionalDto): Promise<CostoAdicionalEntity> {
    const costoAdicional = this.costoAdicionalRepository.create(costoAdicionalData);
    return await this.costoAdicionalRepository.save(costoAdicional);
  }

  async deleteCostosByCompraId(compraId: number): Promise<void> {
    await this.costoAdicionalRepository.delete({ compra_id: compraId });
  }
}
