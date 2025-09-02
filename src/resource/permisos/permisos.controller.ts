import {  Controller } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { BaseController } from 'src/base-service/base-controller.controller';

@Controller('permisos')
export class PermisosController extends BaseController<PermissionEntity>{
    constructor(protected readonly permisoService:PermisosService){
        super(permisoService);
    }
}
