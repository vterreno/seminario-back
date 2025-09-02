import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/base-service/base-service.service';
import { RoleEntity } from 'src/database/core/roles.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class RolesService extends BaseService<RoleEntity> {
    findManyOptions: FindManyOptions<RoleEntity> = {};
    findOneOptions: FindOneOptions<RoleEntity> = {
        relations: ['permisos'],
    };
    constructor(
        @InjectRepository(RoleEntity) 
        protected roleService: Repository<RoleEntity>,
    ){
        super(roleService);
    }

}
