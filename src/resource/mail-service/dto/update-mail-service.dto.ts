import { PartialType } from '@nestjs/mapped-types';
import { CreateMailServiceDto } from './create-mail-service.dto';

export class UpdateMailServiceDto extends PartialType(CreateMailServiceDto) {}
