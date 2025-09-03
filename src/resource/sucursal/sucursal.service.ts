import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';


@Injectable()
export class SucursalService extends BaseService<sucursalEntity> {
  findManyOptions: FindManyOptions<sucursalEntity> = {};
  findOneOptions: FindOneOptions<sucursalEntity> = {};
  constructor(
    @InjectRepository(sucursalEntity)
    protected sucursalService: Repository<sucursalEntity>,
  ) {
    super(sucursalService);
  }
}
