import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCostoAdicionalDto {
    @IsOptional()
    @IsString()
    concepto?: string;

    @IsNumber()
    compra_id: number;

    @IsNotEmpty({ message: 'El monto es requerido' })
    @IsNumber({}, { message: 'El monto debe ser un número' })
    monto: number;
}
