import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { BaseController } from 'src/base-service/base-controller.controller';
import { empresaEntity } from 'src/database/core/empresa.entity';


@Controller('empresa')
export class EmpresaController extends BaseController<empresaEntity>{
    constructor(protected readonly empresaService:EmpresaService){
        super(empresaService);
    }

    @Post('bulk/delete')
    async deleteEmpresas(@Body() body: { ids: number[] }) {
        return await this.empresaService.deleteEmpresas(body.ids);
    }
}
