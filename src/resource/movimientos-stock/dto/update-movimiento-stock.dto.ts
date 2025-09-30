import { PartialType } from '@nestjs/mapped-types';
import { CreateMovimientoStockDto } from './create-movimiento-stock.dto';

export class UpdateMovimientoStockDto extends PartialType(CreateMovimientoStockDto) {}
