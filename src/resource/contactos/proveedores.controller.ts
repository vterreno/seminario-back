import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards, Req } from '@nestjs/common';
import { ContactosService } from './contactos.service';
import { BaseController } from 'src/base-service/base-controller.controller';
import { contactoEntity } from 'src/database/core/contacto.entity';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Entity as EntityDecorator } from 'src/middlewares/decorators/entity.decorator';
import { CreateContactoDto } from './dto/create-contacto.dto';
import { UpdateContactoDto } from './dto/update-contacto.dto';
import { RequestWithUser } from '../users/interface/request-user';

@UseGuards(AuthGuard, PermissionsGuard)
@Controller('proveedores')
@EntityDecorator('proveedor')
export class ProveedoresController extends BaseController<contactoEntity> {
  constructor(
    protected readonly contactosService: ContactosService,
  ) {
    super(contactosService);
  }

  @Get('all')
  @Action('ver')
  async getAllProveedores(@Req() req: RequestWithUser) {
    try {
      const user = req.user;
      const isSuperAdmin = user?.role?.nombre === 'super_admin';
      const empresaId = user?.empresa?.id;
      
      const result = await this.contactosService.findByRoles(['proveedor', 'ambos'], empresaId, isSuperAdmin);
      return result;
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      throw error;
    }
  }

  @Get(':id')
  @Action('ver')
  async getProveedorById(@Param('id', ParseIntPipe) id: number) {
    return await this.contactosService.findOne({ where: { id } });
  }

  @Post()
  @Action('agregar')
  async createProveedor(@Body() dto: CreateContactoDto, @Req() req: RequestWithUser) {
    const empresaId = req.user?.empresa?.id || dto['empresa_id'];
    const data: Partial<contactoEntity> = { ...dto, rol: dto.rol || 'proveedor', empresa_id: empresaId } as any;
    return await this.contactosService.createContacto(data);
  }

  @Put(':id')
  @Action('modificar')
  async updateProveedor(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContactoDto) {
    const { provincia, ciudad, ...rest } = dto as any;
    return await this.contactosService.updateContacto(id, rest as Partial<contactoEntity>);
  }

  @Patch(':id')
  @Action('modificar')
  async updateProveedorPartial(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateContactoDto) {
    const { provincia, ciudad, ...rest } = dto as any;
    return await this.contactosService.updateContacto(id, rest as Partial<contactoEntity>);
  }

  @Post('bulk/status')
  @Action('modificar')
  async updateProveedoresStatus(@Body() body: { ids: number[], estado: boolean }) {
    return await this.contactosService.updateContactosStatus(body.ids, body.estado);
  }
}


