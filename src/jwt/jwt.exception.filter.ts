// Filtro que captura errores JWT y devuelve respuestas HTTP claras para token expirado, 
// inválido o sin autorización.

import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

// Solo captura errores JWT específicos y UnauthorizedException
// Deja que NestJS maneje otras excepciones como BadRequestException
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

    // Este caso no debería ocurrir ya que solo capturamos tipos específicos
    return response.status(500).json({ message: 'Internal server error' });
  }
}
