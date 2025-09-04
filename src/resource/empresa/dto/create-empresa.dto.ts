import { IsString, IsNotEmpty, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreateEmpresaDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre de la empresa es requerido' })
    @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
    name: string;

    @IsOptional()
    @IsBoolean({ message: 'El estado debe ser un valor booleano' })
    estado?: boolean = true; // por defecto true
}
