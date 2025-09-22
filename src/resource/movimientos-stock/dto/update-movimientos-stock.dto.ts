import { PartialType } from '@nestjs/mapped-types';
import { CreateMovimientosStockDto } from './create-movimientos-stock.dto';

export class UpdateMovimientosStockDto extends PartialType(CreateMovimientosStockDto) {}
