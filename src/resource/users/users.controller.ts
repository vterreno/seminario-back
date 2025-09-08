import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards} from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { Request } from 'express';
import { AuthGuard } from '../../middlewares/auth.middleware';
import { RequestWithUser } from 'src/resource/users/interface/request-user';
import { UserEntity } from 'src/database/core/user.entity';
import { BaseController } from 'src/base-service/base-controller.controller';
import { UserI } from './interface/user.interface';
import { Action } from 'src/middlewares/decorators/action.decorator';
import { Public } from 'src/middlewares/decorators/public.decorator';
import { Entity } from 'typeorm';

@Controller('users')
@Entity('usuario')
export class UsersController extends BaseController<UserEntity> {
  constructor(protected readonly service:UsersService){
    super(service);
  }
  
  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: RequestWithUser) {
    const user = req.user;
    return this.service.me(user as UserI);
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
  
  @UseGuards(AuthGuard)
  @Post('create-user')
  @Action('crear')
  createUser(@Body() createUserDto: CreateUserDTO, @Req() request: RequestWithUser) {
    return this.service.createUser(createUserDto);
  }

  // Esta ruta es para verificar si el usuario tiene un permiso específico
  @UseGuards(AuthGuard)
  @Get('can-do/:permission')
  canDo(
    @Req() request: RequestWithUser,
    @Param('permission') permission: string,
  ) {
    return this.service.canDo(request.user as UserI, permission);
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

  @UseGuards(AuthGuard)
  @Patch('bulk/status')
  @Action('modificar')
  updateUsersStatus(
    @Body('userIds') userIds: number[],
    @Body('status') status: boolean,
    @Req() request: RequestWithUser,
  ) {
    return this.service.updateUsersStatus(userIds, status, request.user);
  }

  @UseGuards(AuthGuard)
  @Delete('bulk/delete')
  @Action('eliminar')
  deleteUsers(
    @Body('userIds') userIds: number[],
    @Req() request: RequestWithUser,
  ) {
    return this.service.deleteUsers(userIds, request.user);
  }


}
