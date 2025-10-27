import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, BadRequestException, Put } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { ventaEntity } from 'src/database/core/venta.entity';
import { BaseController } from 'src/base-service/base-controller.controller';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { RequestWithUser } from '../users/interface/request-user';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('ventas')
@Controller('ventas')
export class VentasController extends BaseController<ventaEntity>{
    constructor(protected readonly ventasService: VentasService){
        super(ventasService);
    }

    @Get()
    @Action('ver')
    async getAllVentas(@Req() req: RequestWithUser) {
        const user = req.user;
        // If user has a company, filter ventas by that company
        if (user.empresa?.id) {
            //Extrae los IDs de todas sus sucursales
            const sucursalIds = user.sucursales.map(sucursal => sucursal.id);

            return await this.ventasService.getVentasBySucursal(sucursalIds);
        }
        // If no company (superadmin), return all ventas
        return await this.ventasService.getAllVentas();
    }

    @Get(':id')
    @Action('ver')
    async getVentaById(@Param('id') id: number) {
        return await this.ventasService.findById(id);
    }

    @Get('empresa/:id')
    @Action('ver')
    async getVentasByEmpresa(@Param('id') id: number) {
        return await this.ventasService.getVentasByEmpresa(id);
    }

    @Get('sucursal/:id')
    @Action('ver')
    async getVentasBySucursal(@Param('id') id: number) {
        return await this.ventasService.getVentasBySucursal([id]);
    }

    @Post()
    @Action('agregar')
    async createVenta(@Body() ventaData: CreateVentaDto, @Req() req: RequestWithUser) {
        const user = req.user;
        // If user has a company and sucursal_id is not provided, assign that company to the venta
        if (!ventaData.sucursal_id) {
            throw new BadRequestException('Debes proporcionar un sucursal_id válido para la venta');
        }

        return await this.ventasService.createVenta(ventaData);
    }


    @Delete(':id')
    @Action('eliminar')
    async deleteVenta(@Param('id') id: number, @Req() req: RequestWithUser) {
        const user = req.user;
        
        try {
            // Verify the venta belongs to the user's company (if user has a company)
            if (user.empresa?.id) {
                const existingVenta = await this.ventasService.findById(id);
                
                if (!existingVenta) {
                    throw new BadRequestException(`No se encontró la venta con ID ${id}`);
                }
                
                if (!existingVenta.sucursal) {
                    throw new BadRequestException('La venta no tiene una sucursal asociada');
                }
                
                if (existingVenta.sucursal.empresa?.id !== user.empresa.id) {
                    throw new BadRequestException('No tienes permisos para eliminar esta venta');
                }
            }

            await this.ventasService.deleteVenta(id);
            return { message: 'Venta eliminada exitosamente' };
        } catch (error) {
            console.error(`Error al eliminar venta ${id}:`, error.message);
            throw error;
        }
    }

    @Delete('bulk/delete')
    @Action('eliminar')
    async bulkDeleteVentas(@Body() body: { ids: number[] }, @Req() req: RequestWithUser) {
        const user = req.user;
        const { ids } = body;

        try {
            await this.ventasService.bulkDeleteVentas(
                ids, 
                user.empresa?.id
            );
            return { message: `${ids.length} ventas eliminadas exitosamente` };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
