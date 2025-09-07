import { PartialType } from "@nestjs/mapped-types";
import { CreateSucursalesDto } from "./create-sucursales.dto";

export class UpdateSucursalesDto extends PartialType(CreateSucursalesDto) {
    id?: number;
    data?: any;
}