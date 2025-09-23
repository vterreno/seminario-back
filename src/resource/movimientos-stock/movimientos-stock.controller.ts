import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query, ParseIntPipe } from '@nestjs/common';
import { BaseController } from 'src/base-service/base-controller.controller';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { MovimientosStockService } from './movimientos-stock.service';
import { RequestWithUser } from '../users/interface/request-user';
import { MovimientosStockValidationPipe } from './pipe/movimiento-validation.pipe';
import { CreateMovimientoStockDto } from './dto/create-movimiento-stock.dto';
import { AjusteStockDto } from './dto/ajuste-stock.dto';
import { TipoMovimientoStock } from 'src/database/core/enums/TipoMovimientoStock.enum';

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('movimiento_stock')
@Controller('movimientos-stock')
export class MovimientosStockController extends BaseController<MovimientoStockEntity>{
    constructor(protected readonly movimientoStockService:MovimientosStockService){
        super(movimientoStockService);
    }

    @Post()
    @Action('agregar')
    async create(@Body(MovimientosStockValidationPipe) createDto: CreateMovimientoStockDto): Promise<MovimientoStockEntity> {
        return this.movimientoStockService.create(createDto);
    }

    @Get()
    @Action('ver')
    async getAllMovimientos(@Req() req: RequestWithUser) {
        const user = req.user;
        
        if (!user) {
            throw new Error('Usuario no encontrado en la request');
        }
        
        // If user has a company, filter movimientos by that company
        if (user.empresa?.id) {
            return await this.movimientoStockService.getMovimientosByEmpresa(user.empresa.id);
        }
        // If no company (superadmin), return all movimientos
        return await this.movimientoStockService.getAllMovimientos();
    }

    @Post('ajuste-stock/:productoId')
    @Action('ajustar')
    async realizarAjusteStock(
        @Param('productoId', ParseIntPipe) productoId: number,
        @Body() ajusteData: AjusteStockDto,
        @Req() req: RequestWithUser
    ): Promise<MovimientoStockEntity> {
        const user = req.user;
        
        if (!user) {
            throw new Error('Usuario no encontrado en la request');
        }

        // Convert frontend data to backend format
        const cantidad = ajusteData.tipo_ajuste === 'aumento' 
            ? Math.abs(ajusteData.cantidad) 
            : -Math.abs(ajusteData.cantidad);

        const movimientoData: Partial<MovimientoStockEntity> = {
            tipo_movimiento: TipoMovimientoStock.AJUSTE_MANUAL,
            descripcion: ajusteData.motivo,
            cantidad: cantidad,
            producto_id: productoId,
            // Si el usuario tiene empresa, usar esa empresa
            // Si no tiene empresa (superadmin), el servicio obtendrá la empresa del producto
            empresa_id: user.empresa?.id
        };

        return this.movimientoStockService.realizarAjusteStock(movimientoData);
    }

    @Get('producto/:productoId')
    @Action('ver')
    async getMovimientosByProducto(
        @Param('productoId', ParseIntPipe) productoId: number,
        @Req() req: RequestWithUser
    ) {
        const user = req.user;
        
        if (!user) {
            throw new Error('Usuario no encontrado en la request');
        }
        
        // If user has a company, filter by both producto and company
        if (user.empresa?.id) {
            return await this.movimientoStockService.getMovimientosByProducto(productoId, user.empresa.id);
        }
        
        // If no company (superadmin), get all movimientos for the product
        return await this.movimientoStockService.getMovimientosByProducto(productoId);
    }
}
