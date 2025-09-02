/*Se usa cuando el usuario inicia sesión. Sirve para validar
o tipar que el cuerpo del POST /login contenga email y password.*/
export class LoginDTO {
  email: string;
  password: string;
}
