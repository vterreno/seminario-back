import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards, Req } from '@nestjs/common';
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
  async getAllProveedores() {
    return await this.contactosService.find({ where: [{ rol: 'proveedor' }, { rol: 'ambos' }] as any });
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
  async updateProveedor(@Param('id') id: number, @Body() dto: UpdateContactoDto) {
    return await this.contactosService.updateContacto(id, dto);
  }

  @Patch(':id')
  @Action('modificar')
  async updateProveedorPartial(@Param('id') id: number, @Body() dto: UpdateContactoDto) {
    return await this.contactosService.updateContacto(id, dto);
  }

  @Post('bulk/status')
  @Action('modificar')
  async updateProveedoresStatus(@Body() body: { ids: number[], estado: boolean }) {
    return await this.contactosService.updateContactosStatus(body.ids, body.estado);
  }
}


