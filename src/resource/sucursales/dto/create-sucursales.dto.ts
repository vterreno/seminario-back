import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSucursalesDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsNotEmpty()
    codigo: string;

    @IsString()
    @IsNotEmpty()
    direccion: string;

    @IsBoolean()
    @IsOptional()
    estado: boolean = true;

    @IsNumber()
    @IsOptional()
    empresa_id?: number; // referencia al tenant/empresa - opcional para superadmin
}