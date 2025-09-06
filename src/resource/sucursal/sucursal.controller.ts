import { Controller, Delete, UseGuards} from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { BaseController } from 'src/base-service/base-controller.controller';
import { Entity } from 'typeorm';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';

@UseGuards(AuthGuard, PermissionsGuard)
@Entity('sucursal')
@Controller('sucursal')
export class SucursalController extends BaseController<sucursalEntity>{
    constructor(protected readonly SucursalService:SucursalService){
        super(SucursalService);
    }
}


