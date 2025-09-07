import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    UnauthorizedException,
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
        
        // If no metadata, no permission required
        if (!action || !entity) return true;
        
        const request: RequestWithUser = context.switchToHttp().getRequest();
        const user = request.user;
        
        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado');
        }

        // Check if user has a role
        if (!user.role) {
            throw new ForbiddenException('Usuario sin rol asignado');
        }

        // Get user permissions from role
        const userPermissions = user.role.permissions?.map(p => p.codigo.toLowerCase()) || [];
        const requiredPermission = `${entity}_${action}`.toLowerCase();
        
        // Check if user has the required permission
        if (!userPermissions.includes(requiredPermission)) {
            throw new ForbiddenException(`No tienes permiso para realizar la acción '${action}' en '${entity}'`);
        }
        
        return true;
    }
}