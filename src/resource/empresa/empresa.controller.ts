import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { BaseController } from 'src/base-service/base-controller.controller';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Entity } from 'typeorm';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { RequestWithUser } from '../users/interface/request-user';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';


@UseGuards(AuthGuard, PermissionsGuard)
@Entity('empresa')
@Controller('empresa')
export class EmpresaController extends BaseController<empresaEntity>{
    constructor(protected readonly empresaService:EmpresaService){
        super(empresaService);
    }

    @Get('all')
    @Action('ver')
    async getAllEmpresas() {
        return await this.empresaService.find();
    }

    @Post('bulk/delete')
    @Action('eliminar')
    async deleteEmpresas(@Body() body: { ids: number[] }) {
        return await this.empresaService.deleteEmpresas(body.ids);
    }

    @Patch('mi-empresa')
    @Action('configuracion_empresa')
    async updateMyCompany(@Body() updateData: UpdateEmpresaDto, @Req() request: RequestWithUser) {
        return await this.empresaService.updateMyCompany(updateData, request.user);
    }
}
