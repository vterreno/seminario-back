import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCostoAdicionalDto {
    @IsOptional()
    @IsString()
    concepto?: string;

    @IsNumber()
    compra_id: number;

    @IsNumber()
    monto: number;
}
