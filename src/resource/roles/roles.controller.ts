import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { BaseController } from 'src/base-service/base-controller.controller';
import { RoleEntity } from 'src/database/core/roles.entity';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController extends BaseController<RoleEntity>{
    constructor(protected readonly roleService:RolesService){
        super(roleService);
    }

}
