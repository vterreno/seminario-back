// Filtro que captura errores JWT y devuelve respuestas HTTP claras para token expirado, 
// inválido o sin autorización.

import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

//El decorador @Catch() con tipos específicos limita qué excepciones maneja este filtro
@Catch(TokenExpiredError, JsonWebTokenError, UnauthorizedException)
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

    // This shouldn't happen since we're only catching specific types
    return response.status(500).json({ message: 'Internal server error' });
  }
}
