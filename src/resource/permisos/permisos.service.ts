import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class PermisosService extends BaseService<PermissionEntity> {
    findManyOptions: FindManyOptions<PermissionEntity> = {};
    findOneOptions: FindOneOptions<PermissionEntity> = {
        relations: ['roles'],
    };
    constructor(
        @InjectRepository(PermissionEntity) 
        protected permisoService: Repository<PermissionEntity>,
    ){
        super(permisoService);
    }
}
