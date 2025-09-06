import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { BaseController } from 'src/base-service/base-controller.controller';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Entity } from 'typeorm';


@UseGuards(AuthGuard, PermissionsGuard)
@Entity('empresa')
@Controller('empresa')
export class EmpresaController extends BaseController<empresaEntity>{
    constructor(protected readonly empresaService:EmpresaService){
        super(empresaService);
    }
}
