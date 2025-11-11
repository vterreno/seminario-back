import { Controller, Get, Req, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { BaseController } from 'src/base-service/base-controller.controller';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { RequestWithUser } from '../users/interface/request-user';

@UseGuards(AuthGuard)
@Controller('permisos')
export class PermisosController extends BaseController<PermissionEntity>{
    constructor(protected readonly permisoService:PermisosService){
        super(permisoService);
    }

    @Get('all')
    async getAllPermissions(): Promise<PermissionEntity[]> {
        return await this.permisoService.find();
    }

    @Get('empresa/:empresaId')
    async getPermissionsByEmpresa(@Param('empresaId', ParseIntPipe) empresaId: number): Promise<PermissionEntity[]> {
        return await this.permisoService.getPermisosByEmpresa(empresaId);
    }
}
