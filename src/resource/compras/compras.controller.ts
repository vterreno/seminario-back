import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException, Req, Patch, Put, Delete } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { AsociarPagoCompraDto } from './dto/asociar-pago.dto';
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
  async getAllCompras(@Req() req: RequestWithUser) {
    const user = req.user;

    // Si es super admin, retornar todas las compras
    if (user.role?.nombre?.toLowerCase() === 'superadmin') {
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

  @Put(':id')
  @Action('modificar')
  async updateCompra(
    @Param('id') id: string,
    @Body() updateData: UpdateCompraDto,
    @Req() req: RequestWithUser
  ) {
    const user = req.user;

    // Verificar que la compra existe
    const compra = await this.comprasService.findById(+id);
    
    if (!compra) {
      throw new BadRequestException('Compra no encontrada');
    }

    // Si el usuario tiene empresa, verificar que la compra pertenezca a esa empresa
    if (user.empresa?.id) {
      // Necesitamos cargar la relación empresa de la sucursal
      const compraConEmpresa = await this.comprasService.findByIdWithEmpresa(+id);

      if (!compraConEmpresa || !compraConEmpresa.sucursal || compraConEmpresa.sucursal.empresa?.id !== user.empresa.id) {
        throw new BadRequestException('No tienes permisos para modificar esta compra');
      }
    }

    return await this.comprasService.updateCompra(+id, updateData);
  }

  @Patch(':id/asociar-pago')
  @Action('modificar')
  async asociarPagoACompra(
    @Param('id') id: string,
    @Body() pagoData: AsociarPagoCompraDto,
    @Req() req: RequestWithUser
  ) {
    const user = req.user;

    // Validar que sucursal_id esté presente
    if (!pagoData.sucursal_id) {
      throw new BadRequestException('Debes proporcionar un sucursal_id válido para el pago');
    }

    // Verificar que la compra existe y pertenece a la empresa del usuario (si no es superadmin)
    const compra = await this.comprasService.findById(+id);
    
    if (!compra) {
      throw new BadRequestException('Compra no encontrada');
    }

    // Si el usuario tiene empresa, verificar que la compra pertenezca a esa empresa
    if (user.empresa?.id) {
      // Necesitamos cargar la relación empresa de la sucursal
      const compraConEmpresa = await this.comprasService['compraRepository'].findOne({
        where: { id: +id },
        relations: ['sucursal', 'sucursal.empresa']
      });

      if (!compraConEmpresa || !compraConEmpresa.sucursal || compraConEmpresa.sucursal.empresa?.id !== user.empresa.id) {
        throw new BadRequestException('No tienes permisos para asociar un pago a esta compra');
      }
    }

    return await this.comprasService.asociarPagoACompra(+id, pagoData);
  }

  @Delete(':id')
  @Action('eliminar')
  async deleteCompra(@Param('id') id: string, @Req() req: RequestWithUser) {
    const user = req.user;
    
    try {
      // Verify the compra belongs to the user's company (if user has a company)
      if (user.empresa?.id) {
        const existingCompra = await this.comprasService.findById(+id);
        
        if (!existingCompra) {
          throw new BadRequestException(`No se encontró la compra con ID ${id}`);
        }
        
        if (!existingCompra.sucursal) {
          throw new BadRequestException('La compra no tiene una sucursal asociada');
        }
        
        // Cargar la relación empresa de la sucursal
        const compraConEmpresa = await this.comprasService.findByIdWithSucursalEmpresa(+id);
        
        if (compraConEmpresa && compraConEmpresa.sucursal.empresa?.id !== user.empresa.id) {
          throw new BadRequestException('No tienes permisos para eliminar esta compra');
        }
      }

      await this.comprasService.deleteCompra(+id);
      return { message: 'Compra eliminada exitosamente' };
    } catch (error) {
      console.error(`Error al eliminar compra ${id}:`, error.message);
      throw error;
    }
  }

  @Delete('bulk/delete')
  @Action('eliminar')
  async bulkDeleteCompras(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
    const user = req.user;
    const { ids } = body;

    try {
      await this.comprasService.bulkDeleteCompras(
        ids, 
        user.empresa?.id
      );
      return { message: `${ids.length} compras eliminadas exitosamente` };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  

}
