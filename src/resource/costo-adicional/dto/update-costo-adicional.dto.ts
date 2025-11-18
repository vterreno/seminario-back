import { PartialType } from '@nestjs/mapped-types';
import { CreateCostoAdicionalDto } from './create-costo-adicional.dto';

export class UpdateCostoAdicionalDto extends PartialType(CreateCostoAdicionalDto) {}
