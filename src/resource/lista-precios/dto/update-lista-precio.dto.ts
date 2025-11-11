import { PartialType } from '@nestjs/mapped-types';
import { CreateListaPrecioDto } from './create-lista-precio.dto';

export class UpdateListaPrecioDto extends PartialType(CreateListaPrecioDto) {}
