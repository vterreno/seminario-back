import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACTION_KEY } from '../middlewares/decorators/action.decorator';
import { ENTITY_KEY } from '../middlewares/decorators/entity.decorator';
import { RequestWithUser } from 'src/resource/users/interface/request-user';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const action = this.reflector.get<string>(ACTION_KEY, context.getHandler());
        const entity = this.reflector.get<string>(ENTITY_KEY, context.getClass());
        if (!action || !entity) return true; // Si no hay metadata, no se requiere permiso
        
        const request: RequestWithUser = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) throw new ForbiddenException('Usuario no autenticado');

        const userPermissions = user.role?.permissions?.map(p => p.codigo.toLowerCase()) || [];
        const requiredPermission = `${entity}_${action}`.toLowerCase();
        
        if (!userPermissions.includes(requiredPermission)) {
            throw new ForbiddenException('No tienes permiso para acceder a este recurso');
        }
        return true;
    }
}