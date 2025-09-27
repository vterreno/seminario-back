// Filtro que captura errores JWT y devuelve respuestas HTTP claras para token expirado, 
// inválido o sin autorización.

import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException, HttpException } from '@nestjs/common';
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

    // Si es una HttpException (que incluye BadRequestException), preservar su status y mensaje
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.getResponse();
      return response.status(status).json(
        typeof message === 'string' ? { message } : message
      );
    }

    return response.status(500).json({ message: 'Internal server error' });
  }
}
