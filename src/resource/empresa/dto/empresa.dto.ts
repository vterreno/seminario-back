import { IsString, IsNotEmpty } from 'class-validator';

export class EmpresalDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
