import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';


@Injectable()
export class EmpresaService extends BaseService<empresaEntity> {
  findManyOptions: FindManyOptions<empresaEntity> = {};
  findOneOptions: FindOneOptions<empresaEntity> = {
    relations: ['sucursales']
  };
  constructor(
    @InjectRepository(empresaEntity)
    protected empresaService: Repository<empresaEntity>,
  ) {
    super(empresaService);
  } 
}
