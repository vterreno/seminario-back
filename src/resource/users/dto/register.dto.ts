/*Se usa cuando el usuario se registra. 
Define el cuerpo del POST /register. */
export class RegisterDTO {
  empresa: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
}