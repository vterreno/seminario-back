import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SucursalDto {
    @IsString()
    @IsNotEmpty()
    name:string;

    @IsString()
    @IsNotEmpty()
    codigo_sucursal: string

    @IsString()
    @IsNotEmpty()
    direccion: string

    @IsBoolean()
    estado:boolean;

    @IsNumber()
    @IsNotEmpty()
    empresaId: number; // referencia al tenant/empresa

}