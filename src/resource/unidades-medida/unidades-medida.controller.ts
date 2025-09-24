import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UnidadesMedidaService } from './unidades-medida.service';
import { CreateUnidadMedidaDto, UpdateUnidadMedidaDto, BulkDeleteUnidadMedidaDto } from './dto/unidad-medida.dto';
import { EmpresaId } from '../../common/decorators/empresa-id.decorator';

@Controller('unidades-medida')
export class UnidadesMedidaController {
  constructor(private readonly unidadesMedidaService: UnidadesMedidaService) {}

  @Get()
  findAll(@EmpresaId() empresaId: number) {
    return this.unidadesMedidaService.findAll(empresaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @EmpresaId() empresaId: number) {
    return this.unidadesMedidaService.findOne(id, empresaId);
  }

  @Post()
  create(@Body() createUnidadMedidaDto: CreateUnidadMedidaDto, @EmpresaId() empresaId: number) {
    return this.unidadesMedidaService.create(createUnidadMedidaDto, empresaId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUnidadMedidaDto: UpdateUnidadMedidaDto,
    @EmpresaId() empresaId: number,
  ) {
    return this.unidadesMedidaService.update(id, updateUnidadMedidaDto, empresaId);
  }

  @Delete('bulk-delete')
  bulkDelete(@Body() bulkDeleteDto: BulkDeleteUnidadMedidaDto, @EmpresaId() empresaId: number) {
    return this.unidadesMedidaService.bulkDelete(bulkDeleteDto.ids, empresaId);
  }

  @Get(':id/can-delete')
  canDelete(@Param('id', ParseIntPipe) id: number, @EmpresaId() empresaId: number) {
    return this.unidadesMedidaService.canDelete(id, empresaId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @EmpresaId() empresaId: number) {
    return this.unidadesMedidaService.remove(id, empresaId);
  }
}