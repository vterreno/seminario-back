import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { BaseController } from 'src/base-service/base-controller.controller';
import { MovimientoStockEntity } from 'src/database/core/movimientos-stock.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { MovimientosStockService } from './movimientos-stock.service';
import { RequestWithUser } from '../users/interface/request-user';

@UseGuards(AuthGuard, PermissionsGuard)
@EntityDecorator('movimientos-stock')
@Controller('movimientos-stock')
export class MovimientosStockController extends BaseController<MovimientoStockEntity>{
  constructor(protected readonly movimientoStockService:MovimientosStockService){
      super(movimientoStockService);
  }

  @Post()
  @Action('agregar')
  //Verificar el tema del DTO para ver que recibir
  async create(@Body() createDto: MovimientoStockEntity): Promise<MovimientoStockEntity> {
      return this.movimientoStockService.create(createDto);
  }

  @Get()
  @Action('ver')
  async getAllMovimientos(@Req() req: RequestWithUser) {
      const user = req.user;
      // If user has a company, filter movimientos by that company
      if (user.empresa?.id) {
          return await this.movimientoStockService.getMovimientosByEmpresa(user.empresa.id);
      }
      // If no company (superadmin), return all movimientos
      return await this.movimientoStockService.getAllMovimientos();
  }
  

}
