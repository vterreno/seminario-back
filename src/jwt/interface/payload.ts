import { JwtPayload } from 'jsonwebtoken';
/*
Es una interfaz que extiende el tipo base JwtPayload de la 
librería jsonwebtoken.
Se usa para describir el contenido del token JWT: 
debe incluir al menos el email y el exp (expiración).
*/
export interface Payload extends JwtPayload {
  email: string;
  exp: number;
}
