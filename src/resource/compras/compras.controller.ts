import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, Req } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';

import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { RequestWithUser } from '../users/interface/request-user';

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('compras')
@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Get()
  @Action('ver')
  async getCompras(@Req() req: RequestWithUser) {
    const user = req.user;

    // Si es super admin, retornar todas las compras
    if (user.role?.nombre === 'superadmin') {
      return await this.comprasService.getAllCompras();
    }

    // Si tiene empresa asignada, retornar compras de esa empresa
    if (user.empresa?.id) {
      return await this.comprasService.getComprasByEmpresa(user.empresa.id);
    }

    // Si no tiene empresa, retornar array vacío
    return [];
  }

  @Get(':id')
  @Action('ver')
  async getCompraById(@Param('id') id: string) {
    return await this.comprasService.findById(+id);
  }

  @Post()
  @Action('agregar')
  async createCompra(@Body() compraData: CreateCompraDto, @Req() req: RequestWithUser) {
      // If user has a company and sucursal_id is not provided, assign that company to the compra
      if (!compraData.sucursal_id) {
          throw new BadRequestException('Debes proporcionar un sucursal_id válido para la compra');
      }

      return await this.comprasService.createCompra(compraData);
  }
  

}
