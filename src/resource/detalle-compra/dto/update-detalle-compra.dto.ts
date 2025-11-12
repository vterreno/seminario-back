import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleCompraDto } from './create-detalle-compra.dto';

export class UpdateDetalleCompraDto extends PartialType(CreateDetalleCompraDto) {}
