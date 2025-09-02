// Filtro que captura errores JWT y devuelve respuestas HTTP claras para token expirado, 
// inválido o sin autorización.

import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

//El decorador @Catch() sin argumentos indica que este filtro capturará todas 
// las excepciones que no hayan sido manejadas antes (puedes pasar tipos de error 
// específicos dentro de @Catch para limitar).
@Catch()
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof TokenExpiredError) {
      return response.status(401).json({ message: 'Access token expired' });
    }

    if (exception instanceof JsonWebTokenError) {
      return response.status(401).json({ message: 'Invalid token' });
    }

    if (exception instanceof UnauthorizedException) {
      return response.status(401).json({ message: exception.message || 'Unauthorized' });
    }

    return response.status(500).json({ message: 'Internal server error' });
  }
}
