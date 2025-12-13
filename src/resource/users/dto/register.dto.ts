import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/*Se usa cuando el usuario se registra. 
Define el cuerpo del POST /register. */
export class RegisterDTO {
  @IsNotEmpty({ message: 'El nombre de la empresa es obligatorio' })
  @IsString()
  empresa: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  apellido: string;

  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Formato de email inválido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(7, { message: 'La contraseña debe tener al menos 7 caracteres' })
  password: string;
}