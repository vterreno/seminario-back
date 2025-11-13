import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoProveedorDto } from './create-producto-proveedor.dto';

export class UpdateProductoProveedorDto extends PartialType(CreateProductoProveedorDto) {}
