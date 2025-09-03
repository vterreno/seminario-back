import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { BaseController } from 'src/base-service/base-controller.controller';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { UpdateEmpresaDto } from './interface/empresa.dto';


@Controller('empresa')
export class EmpresaController extends BaseController<empresaEntity>{
    constructor(protected readonly empresaService:EmpresaService){
        super(empresaService);
    }
    @Get()
    getEmpresa(){
        return this.empresaService.findOne({})
    }

    @Put()
    updateEmpresa(@Body() empresaDto: UpdateEmpresaDto){
        return this.empresaService.replace(1, empresaDto);
    }
}
