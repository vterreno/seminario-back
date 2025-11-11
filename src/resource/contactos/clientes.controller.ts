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
@Controller('clientes')
@EntityDecorator('cliente')
export class ClientesController extends BaseController<contactoEntity> {
  constructor(
    protected readonly contactosService: ContactosService,
  ) {
    super(contactosService);
  }

  @Get('all')
  @Action('ver')
  async getAllClientes(@Req() req: RequestWithUser) {
    try {
      const user = req.user;
      const isSuperAdmin = user?.role?.nombre === 'super_admin';
      const empresaId = user?.empresa?.id;
      
      const result = await this.contactosService.findByRoles(['cliente', 'ambos'], empresaId, isSuperAdmin);
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post()
  @Action('agregar')
  async createCliente(@Body() dto: CreateContactoDto, @Req() req: RequestWithUser) {
    const empresaId = req.user?.empresa?.id || dto['empresa_id'];
    const data: Partial<contactoEntity> = { ...dto, rol: dto.rol || 'cliente', empresa_id: empresaId } as any;
    return await this.contactosService.createContacto(data);
  }

  @Put(':id')
  @Action('modificar')
  async updateCliente(@Param('id') id: number, @Body() dto: UpdateContactoDto) {
    const { provincia, ciudad, ...rest } = dto as any;
    return await this.contactosService.updateContacto(id, rest as Partial<contactoEntity>);
  }

  @Patch(':id')
  @Action('modificar')
  async updateClientePartial(@Param('id') id: number, @Body() dto: UpdateContactoDto) {
    const { provincia, ciudad, ...rest } = dto as any;
    return await this.contactosService.updateContacto(id, rest as Partial<contactoEntity>);
  }

  @Post('bulk/status')
  @Action('modificar')
  async updateClientesStatus(@Body() body: { ids: number[], estado: boolean }) {
    return await this.contactosService.updateContactosStatus(body.ids, body.estado);
  }
}


