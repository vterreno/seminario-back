import { PartialType } from "@nestjs/mapped-types";
import { SucursalDto } from "./create-sucursal.dto";

export class UpdateSucursalDto extends PartialType(SucursalDto) {
    
}