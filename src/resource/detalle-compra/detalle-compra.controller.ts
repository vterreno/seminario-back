import { Controller, Get, Post, Body, Param, Delete, Req, Put, BadRequestException } from '@nestjs/common';
import { DetalleCompraService } from './detalle-compra.service';
import { CreateDetalleCompraDto } from './dto/create-detalle-compra.dto';
import { UpdateDetalleCompraDto } from './dto/update-detalle-compra.dto';
import { BaseController } from 'src/base-service/base-controller.controller';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { RequestWithUser } from '../users/interface/request-user';
import { DetalleCompraEntity } from 'src/database/core/detalleCompra.entity';

@Controller('detalle-compra')
export class DetalleCompraController extends BaseController<DetalleCompraEntity> {
  constructor(protected readonly detalleCompraService: DetalleCompraService) {
    super(detalleCompraService);
  }

  @Get()
  @Action('ver')
  async getAllDetalles(@Req() req: RequestWithUser) {
    return await this.detalleCompraService.getAllDetalles();
  }

  @Get(':id')
  @Action('ver')
  async getDetalleById(@Param('id') id: number) {
    return await this.detalleCompraService.findById(id);
  }

  @Get('compra/:compraId')
  @Action('ver')
  async getDetallesByCompra(@Param('compraId') compraId: number) {
    return await this.detalleCompraService.getDetallesByCompra(compraId);
  }

  @Get('producto/:productoId')
  @Action('ver')
  async getDetallesByProducto(@Param('productoId') productoId: number) {
    return await this.detalleCompraService.getDetallesByProducto(productoId);
  }

  @Post()
  @Action('agregar')
  async createDetalle(@Body() detalleData: CreateDetalleCompraDto, @Req() req: RequestWithUser) {
    return await this.detalleCompraService.createDetalle(detalleData);
  }

  @Put(':id')
  @Action('modificar')
  async updateDetalle(@Param('id') id: number, @Body() detalleData: UpdateDetalleCompraDto, @Req() req: RequestWithUser) {
    return await this.detalleCompraService.updateDetalle(id, detalleData);
  }

  @Delete(':id')
  @Action('eliminar')
  async deleteDetalle(@Param('id') id: number, @Req() req: RequestWithUser) {
    await this.detalleCompraService.deleteDetalle(id);
    return { message: 'Detalle de compra eliminado exitosamente' };
  }

  @Delete('bulk/delete')
  @Action('eliminar')
  async bulkDeleteDetalles(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
    const { ids } = body;
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Debe proporcionar un arreglo de IDs');
    }
    await this.detalleCompraService.bulkDeleteDetalles(ids);
    return { message: 'Detalles de compra eliminados exitosamente' };
  }
}