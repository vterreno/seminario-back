import { Body, Controller, Get, Param, Post, Put, Patch, Delete, UseGuards } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { BaseController } from 'src/base-service/base-controller.controller';
import { EmpresaService } from '../empresa/empresa.service';
import { CreateSucursalesDto } from './dto/create-sucursales.dto';
import { UpdateSucursalesDto } from './dto/update-sucursales.dto';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('sucursales')
@EntityDecorator('sucursal')
export class SucursalesController extends BaseController<sucursalEntity>{
    constructor(
        protected readonly sucursalesService: SucursalesService,
        private readonly empresaService: EmpresaService
    ){
        super(sucursalesService);
    }

    @Get('empresas')
    @Action('ver')
    async getEmpresas() {
        return await this.empresaService.find();
    }

    @Get('all')
    @Action('ver')
    async getAllSucursales() {
        return await this.sucursalesService.find();
    }

    @Get('empresa/:empresaId')
    @Action('ver')
    async getSucursalesByEmpresa(@Param('empresaId') empresaId: number) {
        return await this.sucursalesService.findByEmpresa(empresaId);
    }

    @Get(':id')
    @Action('ver')
    async getSucursalById(@Param('id') id: number) {
        return await this.sucursalesService.findOne({ where: { id } });
    }

    @Post()
    @Action('agregar')
    async createSucursal(@Body() sucursal: CreateSucursalesDto) {
        return await this.sucursalesService.create(sucursal);
    }

    @Put(':id')
    @Action('modificar')
    async updateSucursal(@Param('id') id: number, @Body() sucursal: UpdateSucursalesDto) {
        return await this.sucursalesService.replace(id, sucursal);
    }

    @Patch(':id')
    @Action('modificar')
    async updateSucursalPartial(@Param('id') id: number, @Body() sucursal: UpdateSucursalesDto) {
        return await this.sucursalesService.updatePartial(id, sucursal);
    }

    @Delete(':id')
    @Action('eliminar')
    async deleteSucursal(@Param('id') id: number) {
        return await this.sucursalesService.delete(id);
    }

    @Post('bulk/status')
    @Action('modificar')
    async updateSucursalesStatus(@Body() body: { ids: number[], estado: boolean }) {
        return await this.sucursalesService.updateSucursalesStatus(body.ids, body.estado);
    }

    @Post('bulk/delete')
    @Action('eliminar')
    async deleteSucursales(@Body() body: { ids: number[] }) {
        return await this.sucursalesService.deleteSucursales(body.ids);
    }
}


