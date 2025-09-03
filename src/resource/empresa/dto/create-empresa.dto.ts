import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateEmpresaDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsBoolean()
    estado: boolean; // por defecto true
}
