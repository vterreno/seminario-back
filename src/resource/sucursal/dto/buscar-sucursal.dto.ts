import { SucursalDto } from "./create-sucursal.dto";
import { PartialType } from "@nestjs/mapped-types";

export class buscarSucursalDto extends PartialType(SucursalDto) {

}