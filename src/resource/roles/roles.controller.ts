import { Controller, UseGuards } from '@nestjs/common';
import { BaseController } from 'src/base-service/base-controller.controller';
import { RoleEntity } from 'src/database/core/roles.entity';
import { RolesService } from './roles.service';
import { Entity } from 'typeorm';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';

@UseGuards(AuthGuard, PermissionsGuard)
@Entity('roles')
@Controller('roles')
export class RolesController extends BaseController<RoleEntity>{
    constructor(protected readonly roleService:RolesService){
        super(roleService);
    }
}
