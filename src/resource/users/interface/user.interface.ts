/*
Define que debe tener un usuario a nivel de propiedades
Podes hacer que una clase (UserEntity) implemente una interfaz (UserI)
Para asegurarnos de que cumple con esta estructura
*/
export interface UserI {
  email: string;
  password: string;
  permissionCodes: string[];
}
