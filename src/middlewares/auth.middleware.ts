import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/resource/users/users.service';
import { RequestWithUser } from 'src/resource/users/interface/request-user';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('El token no existe o es inválido');
    }
    const token = authHeader.replace('Bearer ', '');
    const payload = this.jwtService.getPayload(token);
    const user = await this.usersService.findByEmailWithRole(payload.email);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    request.user = user;
    return true;
  }
}