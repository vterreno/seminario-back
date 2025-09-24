import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { EmpresaIdPipe } from '../pipes/empresa-id.pipe';

/**
 * Decorator personalizado para extraer empresaId de la request
 * Utiliza el EmpresaIdPipe para validar y extraer el empresaId del token JWT
 * 
 * @example
 * @Get()
 * findAll(@EmpresaId() empresaId: number) {
 *   return this.service.findAll(empresaId);
 * }
 */
export const EmpresaId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return EmpresaIdPipe.extractEmpresaId(request);
  },
);