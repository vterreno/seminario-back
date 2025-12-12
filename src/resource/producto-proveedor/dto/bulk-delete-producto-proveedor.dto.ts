import { IsArray, IsNotEmpty, IsNumber, ArrayMinSize } from 'class-validator';

export class BulkDeleteProductoProveedorDto {
  @IsNotEmpty({ message: 'Los IDs son requeridos' })
  @IsArray({ message: 'Los IDs deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un ID' })
  @IsNumber({}, { each: true, message: 'Cada ID debe ser un número' })
  ids: number[];
}