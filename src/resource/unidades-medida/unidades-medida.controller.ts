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
} from '@nestjs/common';
import { UnidadesMedidaService } from './unidades-medida.service';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto } from './dto/unidad-medida.dto';
import { Request } from 'express';

@Controller('unidades-medida')
export class UnidadesMedidaController {
  constructor(private readonly unidadesMedidaService: UnidadesMedidaService) {}

  @Get()
  findAll(@Req() request: Request) {
    const empresaId = request['user']?.empresaId || 1; // TODO: Obtener de JWT
    return this.unidadesMedidaService.findAll(empresaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const empresaId = request['user']?.empresaId || 1; // TODO: Obtener de JWT
    return this.unidadesMedidaService.findOne(id, empresaId);
  }

  @Post()
  create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto, @Req() request: Request) {
    const empresaId = request['user']?.empresaId || 1; // TODO: Obtener de JWT
    return this.unidadesMedidaService.create(createUnidadMedidaDto, empresaId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto,
    @Req() request: Request,
  ) {
    const empresaId = request['user']?.empresaId || 1; // TODO: Obtener de JWT
    return this.unidadesMedidaService.update(id, updateUnidadMedidaDto, empresaId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const empresaId = request['user']?.empresaId || 1; // TODO: Obtener de JWT
    return this.unidadesMedidaService.remove(id, empresaId);
  }

  @Get(':id/can-delete')
  canDelete(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const empresaId = request['user']?.empresaId || 1; // TODO: Obtener de JWT
    return this.unidadesMedidaService.canDelete(id, empresaId);
  }
}