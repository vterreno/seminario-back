import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from 'src/resource/users/interface/request-user';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/resource/users/users.service';
import { Permissions } from './decorators/permissions.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private reflector:Reflector
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: RequestWithUser = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('El token no existe');
      }
      const token = authHeader.replace('Bearer ','');
      const payload = this.jwtService.getPayload(token);
      const user = await this.usersService.findByEmail(payload.email);
      request.user = user;
      const requiredPermissions = this.reflector.get(Permissions, context.getHandler());
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = user.permissionCodes.some(
          code => requiredPermissions.includes(code.toUpperCase())
        );
        if (!hasPermission) {
          throw new UnauthorizedException('No tienes permiso para acceder a este recurso');
        }
      }      
      return true;
    }catch (error) {
      throw error;
    }
  }
}