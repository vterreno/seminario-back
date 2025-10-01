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
    const user = request['user'];
    const empresaId = user?.empresa?.id;
    const isSuperAdmin = user?.role?.nombre === 'Superadmin';
    
    if (!empresaId && !isSuperAdmin) {
      throw new ConflictException('No se puede acceder a la unidad de medida porque el usuario debe pertenecer a una empresa para realizar esta operación. Contacte al administrador del sistema.');
    }
    
    return this.unidadesMedidaService.findOne(id, empresaId);
  }

  @Post()
  // Removido: @Action('agregar') - Accesible para todos los usuarios autenticados
  create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto, @Req() request: Request) {
    const user = request['user'];
    const userEmpresaId = user?.empresa?.id;
    const isSuperAdmin = user?.role?.nombre === 'Superadmin';
    
    // Para usuarios normales, usar su empresa. Para superadmin, usar la empresa del DTO
    const empresaId = isSuperAdmin ? createUnidadMedidaDto.empresaId : userEmpresaId;
    
    if (!empresaId) {
      if (isSuperAdmin) {
        throw new ConflictException('Como superadmin, debe especificar el ID de la empresa para crear la unidad de medida.');
      } else {
        throw new ConflictException('No se puede crear la unidad de medida porque el usuario debe pertenecer a una empresa para realizar esta operación. Contacte al administrador del sistema.');
      }
    }
    
    return this.unidadesMedidaService.create(createUnidadMedidaDto, empresaId);
  }

  @Patch(':id')
  // Removido: @Action('modificar') - Accesible para todos los usuarios autenticados
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto,
    @Req() request: Request,
  ) {
    const user = request['user'];
    const userEmpresaId = user?.empresa?.id;
    const isSuperAdmin = user?.role?.nombre === 'Superadmin';
    
    if (!userEmpresaId && !isSuperAdmin) {
      throw new ConflictException('No se puede actualizar la unidad de medida porque el usuario debe pertenecer a una empresa para realizar esta operación. Contacte al administrador del sistema.');
    }
    
    // Para usuarios normales, usar su empresa. Para superadmin, permitir empresaId del DTO o undefined
    const empresaId = isSuperAdmin ? updateUnidadMedidaDto.empresaId : userEmpresaId;
    
    return this.unidadesMedidaService.update(id, updateUnidadMedidaDto, empresaId);
  }

  @Delete('bulk-delete')
  // Removido: @Action('eliminar') - Accesible para todos los usuarios autenticados
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteUnidadMedidaDto, @Req() request: Request) {
    const user = request['user'];
    const empresaId = user?.empresa?.id;
    const isSuperAdmin = user?.role?.nombre === 'Superadmin';
    
    if (!empresaId && !isSuperAdmin) {
      throw new ConflictException('No se pueden eliminar las unidades de medida porque el usuario debe pertenecer a una empresa para realizar esta operación. Contacte al administrador del sistema.');
    }
    
    return this.unidadesMedidaService.bulkDelete(bulkDeleteDto.ids, empresaId);
  }

  @Get(':id/can-delete')
  // Removido: @Action('eliminar') - Accesible para todos los usuarios autenticados
  canDelete(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const user = request['user'];
    const empresaId = user?.empresa?.id;
    const isSuperAdmin = user?.role?.nombre === 'Superadmin';
    
    if (!empresaId && !isSuperAdmin) {
      throw new ConflictException('No se puede verificar si la unidad de medida puede ser eliminada porque el usuario debe pertenecer a una empresa para realizar esta operación. Contacte al administrador del sistema.');
    }
    
    return this.unidadesMedidaService.canDelete(id, empresaId);
  }

  @Delete(':id')
  // Removido: @Action('eliminar') - Accesible para todos los usuarios autenticados
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const user = request['user'];
    const empresaId = user?.empresa?.id;
    const isSuperAdmin = user?.role?.nombre === 'Superadmin';
    
    if (!empresaId && !isSuperAdmin) {
      throw new ConflictException('No se puede eliminar la unidad de medida porque el usuario debe pertenecer a una empresa para realizar esta operación. Contacte al administrador del sistema.');
    }
    
    return this.unidadesMedidaService.remove(id, empresaId);
  }
}