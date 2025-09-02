import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { Request } from 'express';
import { AuthGuard } from '../../middlewares/auth.middleware';
import { RequestWithUser } from 'src/resource/users/interface/request-user';
import { Permissions } from 'src/middlewares/decorators/permissions.decorator';
import { UserEntity } from 'src/database/core/user.entity';
import { BaseController } from 'src/base-service/base-controller.controller';

@Controller('users')
export class UsersController extends BaseController<UserEntity> {
  constructor(protected readonly service:UsersService){
    super(service);
  }
  
  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: RequestWithUser) {
    return {
      email: req.user.email,
    };
  }

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
  @Permissions(['asignar_rol'])
  asignarRol(
    @Param('id') userId: number,
    @Body('rol') rol: string,
    @Req() request: RequestWithUser,
  ) {
    return this.service.asignarRol(userId, rol, request.user);
  }

  @Patch(':id/cambiar-contrasena')
  cambiarContrasena(
    @Param('id') userId: number,
    @Body('contrasena') contrasena: string,
  ) {
    return this.service.cambiarContrasena(userId, contrasena);
  }
}
