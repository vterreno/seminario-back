import { PartialType } from "@nestjs/mapped-types";
import { CreateCategoriaDto } from "./create-categoria.dto";

export class BuscarCategoriaDto extends PartialType(CreateCategoriaDto) {}