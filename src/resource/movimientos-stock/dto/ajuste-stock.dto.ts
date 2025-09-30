import { IsEnum, IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';

export class AjusteStockDto {
    @IsEnum(['aumento', 'disminucion'], {
        message: 'El tipo de ajuste debe ser "aumento" o "disminucion"'
    })
    @IsNotEmpty()
    tipo_ajuste: 'aumento' | 'disminucion';

    @IsNumber({}, { message: 'La cantidad debe ser un número' })
    @Min(1, { message: 'La cantidad debe ser mayor a 0' })
    @Max(99999, { message: 'La cantidad no puede ser mayor a 99999' })
    @IsNotEmpty()
    cantidad: number;

    @IsString({ message: 'El motivo debe ser un texto' })
    @IsNotEmpty({ message: 'El motivo es requerido' })
    motivo: string;
}
