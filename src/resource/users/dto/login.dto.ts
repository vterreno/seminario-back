import { IsEmail, IsNotEmpty, IsString } from "class-validator";

/*Se usa cuando el usuario inicia sesión. Sirve para validar
o tipar que el cuerpo del POST /login contenga email y password.*/
export class LoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}