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
import { Request } from 'express';

@Controller('unidades-medida')
@UseGuards(AuthGuard) // Solo verificar autenticación, sin permisos específicos
export class UnidadesMedidaController {
  constructor(private readonly unidadesMedidaService: UnidadesMedidaService) {}

  @Get()
  // Removido: @Action('ver') - Accesible para todos los usuarios autenticados
  findAll(@Req() request: Request) {
    const empresaId = request['user']?.empresa?.id; // Para superadmin puede ser undefined
    return this.unidadesMedidaService.findAll(empresaId);
  }

  @Get(':id')
  // Removido: @Action('ver') - Accesible para todos los usuarios autenticados
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.findOne(id, empresaId);
  }

  @Post()
  // Removido: @Action('agregar') - Accesible para todos los usuarios autenticados
  create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto, @Req() request: Request) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.create(createUnidadMedidaDto, empresaId);
  }

  @Patch(':id')
  // Removido: @Action('modificar') - Accesible para todos los usuarios autenticados
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
  // Removido: @Action('eliminar') - Accesible para todos los usuarios autenticados
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteUnidadMedidaDto, @Req() request: Request) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.bulkDelete(bulkDeleteDto.ids, empresaId);
  }

  @Get(':id/can-delete')
  // Removido: @Action('eliminar') - Accesible para todos los usuarios autenticados
  canDelete(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.canDelete(id, empresaId);
  }

  @Delete(':id')
  // Removido: @Action('eliminar') - Accesible para todos los usuarios autenticados
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const empresaId = request['user']?.empresa?.id;
    if (!empresaId) {
      throw new ConflictException('El usuario debe pertenecer a una empresa para realizar esta operación');
    }
    return this.unidadesMedidaService.remove(id, empresaId);
  }
}