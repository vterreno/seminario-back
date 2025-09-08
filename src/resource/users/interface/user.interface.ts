import { empresaEntity } from "src/database/core/empresa.entity";
import { RoleEntity } from "src/database/core/roles.entity";

/*
Define que debe tener un usuario a nivel de propiedades
Podes hacer que una clase (UserEntity) implemente una interfaz (UserI)
Para asegurarnos de que cumple con esta estructura
*/
export interface UserI {
  email: string;
  password: string;
  empresa?: empresaEntity;
  role?: RoleEntity;
  nombre: string;
  apellido: string;
  status: boolean;
  permissionCodes: string[];
}
