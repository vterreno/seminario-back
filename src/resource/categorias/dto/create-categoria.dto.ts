import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateCategoriaDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre de la categoria es requerido' })
    @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
    nombre: string;

    @IsString()
    @Length(2, 100, { message: 'La descripción debe tener entre 2 y 100 caracteres' })
    descripcion: string;

    @IsNumber({}, { message: 'El ID de empresa debe ser un número' })
    @IsNotEmpty({ message: 'El ID de empresa es requerido' })
    empresa_id: number;

    @IsOptional()
    @IsBoolean({ message: 'El estado debe ser un valor booleano' })
    estado?: boolean;
}
