import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException, Put } from '@nestjs/common';
import { DetalleVentaService } from './detalle-venta.service';
import { CreateDetalleVentaDto } from './dto/create-detalle-venta.dto';
import { UpdateDetalleVentaDto } from './dto/update-detalle-venta.dto';
import { BaseController } from 'src/base-service/base-controller.controller';
import { detalleVentaEntity } from 'src/database/core/detalleVenta.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';
import { RequestWithUser } from '../users/interface/request-user';

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('detalle-venta')
@Controller('detalle-venta')
export class DetalleVentaController extends BaseController<detalleVentaEntity> {
  constructor(protected readonly detalleVentaService: DetalleVentaService) {
    super(detalleVentaService);
  }

  @Get()
  @Action('ver')
  async getAllDetalles(@Req() req: RequestWithUser) {
    return await this.detalleVentaService.getAllDetalles();
  }

  @Get(':id')
  @Action('ver')
  async getDetalleById(@Param('id') id: number) {
    return await this.detalleVentaService.findById(id);
  }

  @Get('venta/:ventaId')
  @Action('ver')
  async getDetallesByVenta(@Param('ventaId') ventaId: number) {
    return await this.detalleVentaService.getDetallesByVenta(ventaId);
  }

  @Get('producto/:productoId')
  @Action('ver')
  async getDetallesByProducto(@Param('productoId') productoId: number) {
    return await this.detalleVentaService.getDetallesByProducto(productoId);
  }

  @Post()
  @Action('agregar')
  async createDetalle(@Body() detalleData: CreateDetalleVentaDto, @Req() req: RequestWithUser) {
    return await this.detalleVentaService.createDetalle(detalleData);
  }

  @Put(':id')
  @Action('modificar')
  async updateDetalle(@Param('id') id: number, @Body() detalleData: UpdateDetalleVentaDto, @Req() req: RequestWithUser) {
    return await this.detalleVentaService.updateDetalle(id, detalleData);
  }

  @Delete(':id')
  @Action('eliminar')
  async deleteDetalle(@Param('id') id: number, @Req() req: RequestWithUser) {
    await this.detalleVentaService.deleteDetalle(id);
    return { message: 'Detalle de venta eliminado exitosamente' };
  }

  @Delete('bulk/delete')
  @Action('eliminar')
  async bulkDeleteDetalles(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
    const { ids } = body;
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Debe proporcionar un arreglo de IDs');
    }
    await this.detalleVentaService.bulkDeleteDetalles(ids);
    return { message: 'Detalles de venta eliminados exitosamente' };
  }
}
