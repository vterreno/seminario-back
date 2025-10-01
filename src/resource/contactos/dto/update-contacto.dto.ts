import { PartialType } from '@nestjs/mapped-types';
import { CreateContactoDto } from './create-contacto.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { CondicionIVA, ContactoRol, TipoIdentificacion } from 'src/database/core/contacto.entity';

export class UpdateContactoDto extends PartialType(CreateContactoDto) {
  // Override to ensure tipo/numero identificación are not accepted for update at DTO level is tricky.
  // We keep service-level enforcement and allow DTO partial fields.
  @IsOptional()
  @IsBoolean()
  estado?: boolean;
}


