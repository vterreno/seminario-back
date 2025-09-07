import { CreateSucursalesDto } from "./create-sucursales.dto";
import { PartialType } from "@nestjs/mapped-types";

export class BuscarSucursalesDto extends PartialType(CreateSucursalesDto) {

}