import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  UseGuards,
  ConflictException,
} from '@nestjs/common';
import { UnidadesMedidaService } from './unidades-medida.service';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto, BulkDeleteUnidadMedidaDto } from './dto/unidad-medida.dto';
import { AuthGuard } from 'src/middlewares/auth.middleware';
import { PermissionsGuard } from 'src/middlewares/permission.middleware';
import { Entity } from 'src/middlewares/decorators/entity.decorator';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Request } from 'express';

@Controller('unidades-medida')
@Entity('unidad_medida')
@UseGuards(AuthGuard, PermissionsGuard)
export class UnidadesMedidaController {
  constructor(private readonly unidadesMedidaService: UnidadesMedidaService) {}

  @Get()
  @Action('ver')
  findAll(@Req() request: Request) {
    const empresaId = request['user']?.empresa?.id; // Para superadmin puede ser undefined
    return this.unidadesMedidaService.findAll(empresaId);
  }

  @Get(':id')
  @Action('ver')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.findOne(id, empresaId);
  }

  @Post()
  @Action('agregar')
  create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto, @Req() request: Request) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.create(createUnidadMedidaDto, empresaId);
  }

  @Patch(':id')
  @Action('modificar')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto,
    @Req() request: Request,
  ) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.update(id, updateUnidadMedidaDto, empresaId);
  }

  @Delete('bulk-delete')
  @Action('eliminar')
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteUnidadMedidaDto, @Req() request: Request) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.bulkDelete(bulkDeleteDto.ids, empresaId);
  }

  @Get(':id/can-delete')
  @Action('eliminar')
  canDelete(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.canDelete(id, empresaId);
  }

  @Delete(':id')
  @Action('eliminar')
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.remove(id, empresaId);
  }
}