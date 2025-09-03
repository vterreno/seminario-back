import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaDto } from './create-empresa.dto';

export class buscarEmpresaDto extends PartialType(CreateEmpresaDto) {

}
