import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException, Put } from '@nestjs/common';
import { PagoService } from './pago.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { UpdatePagoDto } from './dto/update-pago.dto';
import { BaseController } from 'src/base-service/base-controller.controller';
import { pagoEntity } from 'src/database/core/pago.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';
import { RequestWithUser } from '../users/interface/request-user';

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('pago')
@Controller('pago')
export class PagoController extends BaseController<pagoEntity> {
  constructor(protected readonly pagoService: PagoService) {
    super(pagoService);
  }

  @Get()
  @Action('ver')
  async getAllPagos(@Req() req: RequestWithUser) {
    const user = req.user;
    // If user has a company, filter pagos by that company/sucursal
    if (user.empresa?.id) {
      return await this.pagoService.getPagosBySucursal(user.empresa.id);
    }
    // If no company (superadmin), return all pagos
    return await this.pagoService.getAllPagos();
  }

  @Get(':id')
  @Action('ver')
  async getPagoById(@Param('id') id: number) {
    return await this.pagoService.findById(id);
  }

  @Get('sucursal/:id')
  @Action('ver')
  async getPagosBySucursal(@Param('id') id: number) {
    return await this.pagoService.getPagosBySucursal(id);
  }

  @Post()
  @Action('agregar')
  async createPago(@Body() pagoData: CreatePagoDto, @Req() req: RequestWithUser) {
    const user = req.user;
    // If user has a company and sucursal_id is not provided, assign that company to the pago
    if (user.empresa?.id && !pagoData.sucursal_id) {
      pagoData.sucursal_id = user.empresa.id;
    }

    // Convertir el DTO a la estructura de la entidad
    const pagoEntity: Partial<pagoEntity> = {
      fecha_pago: new Date(pagoData.fecha_pago),
      monto_pago: pagoData.monto_pago,
      metodo_pago: pagoData.metodo_pago as 'efectivo' | 'transferencia',
      sucursal: { id: pagoData.sucursal_id } as any,
    };

    return await this.pagoService.createPago(pagoEntity);
  }

  @Put(':id')
  @Action('modificar')
  async updatePago(@Param('id') id: number, @Body() pagoData: UpdatePagoDto, @Req() req: RequestWithUser) {
    const user = req.user;

    // Verify the pago belongs to the user's company (if user has a company)
    if (user.empresa?.id) {
      const existingPago = await this.pagoService.findById(id);
      if (!existingPago) {
        throw new BadRequestException('Pago no encontrado');
      }
      if (existingPago.sucursal.empresa.id !== user.empresa.id) {
        throw new BadRequestException('No tienes permisos para modificar este pago');
      }
      // Ensure sucursal_id doesn't change to a sucursal outside the user's empresa
      if (pagoData.sucursal_id) {
        // Fetch the sucursal to check its empresa
        const sucursal = await this.pagoService.getSucursalById(pagoData.sucursal_id);
        if (!sucursal || sucursal.empresa.id !== user.empresa.id) {
          throw new BadRequestException('No puedes cambiar la sucursal del pago');
        }
      }
    }

    // Convertir el DTO a la estructura de la entidad
    const pagoEntity: Partial<pagoEntity> = {};
    if (pagoData.fecha_pago !== undefined) {
      pagoEntity.fecha_pago = new Date(pagoData.fecha_pago);
    }
    if (pagoData.monto_pago !== undefined) {
      pagoEntity.monto_pago = pagoData.monto_pago;
    }
    if (pagoData.metodo_pago !== undefined) {
      pagoEntity.metodo_pago = pagoData.metodo_pago as 'efectivo' | 'transferencia';
    }
    if (pagoData.sucursal_id !== undefined) {
      pagoEntity.sucursal = { id: pagoData.sucursal_id } as any;
    }

    return await this.pagoService.updatePago(id, pagoEntity);
  }

  @Delete(':id')
  @Action('eliminar')
  async deletePago(@Param('id') id: number, @Req() req: RequestWithUser) {
    const user = req.user;
    
    // Verify the pago belongs to the user's company (if user has a company)
    if (user.empresa?.id) {
      const existingPago = await this.pagoService.findById(id);
      if (existingPago.sucursal.empresa.id !== user.empresa.id) {
        throw new BadRequestException('No tienes permisos para eliminar este pago');
      }
    }

    await this.pagoService.deletePago(id);
    return { message: 'Pago eliminado exitosamente' };
  }

  @Delete('bulk/delete')
  @Action('eliminar')
  async bulkDeletePagos(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
    const user = req.user;
    const { ids } = body;

    if (!ids || ids.length === 0) {
      throw new BadRequestException('Debe proporcionar un arreglo de IDs');
    }

    await this.pagoService.bulkDeletePagos(ids, user.empresa?.id);
    return { message: 'Pagos eliminados exitosamente' };
  }
}
