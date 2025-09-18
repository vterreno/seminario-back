import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateMarcaDto {
    @IsString({ message: 'El nombre debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    nombre: string;

    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
    descripcion?: string;

    @IsNumber({}, { message: 'El ID de empresa debe ser un número' })
    @IsNotEmpty({ message: 'El ID de empresa es requerido' })
    empresa_id: number;

    @IsOptional()
    @IsBoolean({ message: 'El estado debe ser un valor booleano' })
    estado?: boolean;
}
