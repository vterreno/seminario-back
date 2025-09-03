import { Controller, Delete} from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { BaseController } from 'src/base-service/base-controller.controller';

@Controller('sucursal')
export class SucursalController extends BaseController<sucursalEntity>{
    constructor(protected readonly SucursalService:SucursalService){
        super(SucursalService);
    }
    // @Delete(':id')
    // Poner toda la logica para eliminar una sucursal
}


