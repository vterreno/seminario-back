import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class MovimientosStockService extends BaseService<MovimientoStockEntity>{
  findManyOptions: FindManyOptions<MovimientoStockEntity> = {};
  findOneOptions: FindOneOptions<MovimientoStockEntity> = {};
  constructor(
      @InjectRepository(MovimientoStockEntity) 
      protected movimientoStockRepository: Repository<MovimientoStockEntity>,
  ){
      super(movimientoStockRepository);
  }

  async create(data: Partial<MovimientoStockEntity>): Promise<MovimientoStockEntity> {
      const newMovimiento = this.movimientoStockRepository.create(data);
      return await this.movimientoStockRepository.save(newMovimiento);
  }
  // Get marcas filtered by company
  async getMovimientosByEmpresa(empresaId: number): Promise<MovimientoStockEntity[]> {
      return await this.movimientoStockRepository.find({
          where: { empresa_id: empresaId },
      });
  }

  // Get all marcas (for superadmin)
  async getAllMovimientos(): Promise<MovimientoStockEntity[]> {
      return await this.movimientoStockRepository.find({
          relations: ['empresa'],
      });
  }
}
