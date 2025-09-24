import { Injectable, PipeTransform, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Pipe para validar y extraer el empresaId del token JWT en la request
 * Lanza UnauthorizedException si no se encuentra empresaId válido
 */
@Injectable()
export class EmpresaIdPipe implements PipeTransform {
  transform(value: any, metadata?: any): number {
    // En un pipe de parámetro personalizado, necesitamos acceder al contexto
    // Para esto, usaremos un decorator personalizado junto con este pipe
    throw new Error('Este pipe debe usarse con el decorator @EmpresaId()');
  }

  /**
   * Método estático para extraer empresaId de la request
   * @param request - Request object de Express
   * @returns empresaId del usuario autenticado
   * @throws UnauthorizedException si no se encuentra empresaId
   */
  static extractEmpresaId(request: Request): number {
    const empresaId = request['user']?.empresaId;
    
    if (!empresaId || typeof empresaId !== 'number') {
      throw new UnauthorizedException('No se encontró información de empresa válida en el token de usuario');
    }
    
    return empresaId;
  }
}