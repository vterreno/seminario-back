import { Body, Controller, Get, Param, Post, Put, Patch, Delete } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { BaseController } from 'src/base-service/base-controller.controller';
import { EmpresaService } from '../empresa/empresa.service';
import { CreateSucursalesDto } from './dto/create-sucursales.dto';
import { UpdateSucursalesDto } from './dto/update-sucursales.dto';

@Controller('sucursales')
export class SucursalesController extends BaseController<sucursalEntity>{
    constructor(
        protected readonly sucursalesService: SucursalesService,
        private readonly empresaService: EmpresaService
    ){
        super(sucursalesService);
    }

    @Get('empresas')
    async getEmpresas() {
        return await this.empresaService.find();
    }

    @Get('all')
    async getAllSucursales() {
        return await this.sucursalesService.find();
    }

    @Get('empresa/:empresaId')
    async getSucursalesByEmpresa(@Param('empresaId') empresaId: number) {
        return await this.sucursalesService.findByEmpresa(empresaId);
    }

    @Get(':id')
    async getSucursalById(@Param('id') id: number) {
        return await this.sucursalesService.findOne({ where: { id } });
    }

    @Post()
    async createSucursal(@Body() sucursal: CreateSucursalesDto) {
        return await this.sucursalesService.create(sucursal);
    }

    @Put(':id')
    async updateSucursal(@Param('id') id: number, @Body() sucursal: UpdateSucursalesDto) {
        return await this.sucursalesService.replace(id, sucursal);
    }

    @Patch(':id')
    async updateSucursalPartial(@Param('id') id: number, @Body() sucursal: UpdateSucursalesDto) {
        return await this.sucursalesService.updatePartial(id, sucursal);
    }

    @Delete(':id')
    async deleteSucursal(@Param('id') id: number) {
        return await this.sucursalesService.delete(id);
    }

    @Post('bulk/status')
    async updateSucursalesStatus(@Body() body: { ids: number[], estado: boolean }) {
        return await this.sucursalesService.updateSucursalesStatus(body.ids, body.estado);
    }

    @Post('bulk/delete')
    async deleteSucursales(@Body() body: { ids: number[] }) {
        return await this.sucursalesService.deleteSucursales(body.ids);
    }
}


