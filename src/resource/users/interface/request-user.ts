import { Request } from 'express';
import { UserEntity } from 'src/database/core/user.entity';
/*
Esto se usa cuando querés extender el tipo de Request de Express, 
para incluir un campo adicional user.
Muy útil en middleware o guards para acceder al usuario autenticado 
en la request (req.user).
*/
export interface RequestWithUser extends Request {
  user?: UserEntity;
}
