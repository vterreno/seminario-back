import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './create-empresa.dto';

export class BuscarEmpresaDto extends PartialType(CreateEmpresaDto) {

}
