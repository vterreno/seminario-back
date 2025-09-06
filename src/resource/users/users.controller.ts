import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { Request } from 'express';
import { AuthGuard } from '../../middlewares/auth.middleware';
import { RequestWithUser } from 'src/resource/users/interface/request-user';
import { UserEntity } from 'src/database/core/user.entity';
import { BaseController } from 'src/base-service/base-controller.controller';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Public } from 'src/middlewares/decorators/public.decorator';

@Controller('users')
export class UsersController extends BaseController<UserEntity> {
  constructor(protected readonly service:UsersService){
    super(service);
  }
  
  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: RequestWithUser) {
    const user = req.user;
    return {
      id: user.id,
      name: `${user.nombre} ${user.apellido}`,
      email: user.email,
      roles: user.role ? [{
        id: user.role.id,
        nombre: user.role.nombre,
        permissions: user.role.permissions || []
      }] : [],
      permissions: user.permissionCodes || []
    };
  }
  
  @Public()
  @Post('login')
  login(@Body() body: LoginDTO) {
    return this.service.login(body);
  }

  @Post('register')
  register(@Body() body: RegisterDTO) {
    return this.service.register(body);
  }

  // Esta ruta es para verificar si el usuario tiene un permiso específico
  @UseGuards(AuthGuard)
  @Get('can-do/:permission')
  canDo(
    @Req() request: RequestWithUser,
    @Param('permission') permission: string,
  ) {
    return this.service.canDo(request.user, permission);
  }

  // Esto es para generar un nuevo access token a partir de un refresh token
  @Post('refresh-token')
  refreshToken(@Req() request: Request) {
    return this.service.refreshToken(
      request.headers['refresh-token'] as string,
    );
  }

  @UseGuards(AuthGuard)
  @Patch(':id/asignar-rol')
  @Action('asignar_rol')
  asignarRol(
    @Param('id') userId: number,
    @Body('rol') rol: string,
    @Req() request: RequestWithUser,
  ) {
    return this.service.asignarRol(userId, rol, request.user);
  }

  @Patch('cambiar-contrasena')
  cambiarContrasena(
    @Body('contrasena') contrasena: string,
    @Body('email') email: string,
  ) {
    return this.service.cambiarContrasena(contrasena, email);
  }

  // Endpoint para validar el access token
  @UseGuards(AuthGuard)
  @Get('validate-token')
  validateToken(@Req() req: RequestWithUser) {
    return {
      valid: true,
      user: {
        email: req.user.email,
        id: req.user.id,
      }
    };
  }


}
