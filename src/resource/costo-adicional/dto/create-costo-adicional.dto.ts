import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCostoAdicionalDto {
    @IsOptional()
    @IsString()
    concepto?: string;

    @IsNotEmpty({ message: 'El id de la compra es requerido' })
    @IsNumber({}, { message: 'El id de la compra debe ser un número' })
    compra_id: number;

    @IsNotEmpty({ message: 'El monto es requerido' })
    @IsNumber({}, { message: 'El monto debe ser un número' })
    monto: number;
}
