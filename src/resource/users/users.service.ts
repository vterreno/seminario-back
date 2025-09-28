import { BadRequestException, HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from 'src/resource/users/dto/login.dto';
import { RegisterDTO } from 'src/resource/users/dto/register.dto';
import { UserI } from 'src/resource/users/interface/user.interface';
import { UserEntity } from '../../database/core/user.entity';
import { hashSync, compareSync } from 'bcrypt';
import { JwtService } from 'src/jwt/jwt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { RoleEntity } from 'src/database/core/roles.entity';
import { BaseService } from 'src/base-service/base-service.service';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { MailServiceService } from '../mail-service/mail-service.service';

@Injectable()
export class UsersService extends BaseService<UserEntity> {
    constructor(
    private jwtService: JwtService,
    private mailService: MailServiceService,


    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,

    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,

    @InjectRepository(empresaEntity)
    private readonly empresaRepository: Repository<empresaEntity>,

    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {
    super(userRepository);
    // Set default relations for find operations
    this.findManyOptions = {
      relations: ['role', 'empresa']
    };
    this.findOneOptions = {
      relations: ['role', 'empresa']
    };
  }
  async refreshToken(refreshToken: string) {
    return this.jwtService.refreshToken(refreshToken);
  }
  canDo(user: UserI, permission: string): boolean {
    const permissions = permission.split(',');
    const userPermissions = user.permissionCodes.map(p => p.toLowerCase());
    const hasPermission = permissions.some(p => userPermissions.includes(p.toLowerCase()));
    if (!hasPermission) {
      throw new UnauthorizedException();
    }
    return true;
  }

  async me(user: UserI) {
    const response = {
      name: `${user.nombre} ${user.apellido}`,
      email: user.email,
      empresa: user.empresa ? {
        id: user.empresa.id,
        nombre: user.empresa.name
      } : {
        id: null,
        nombre: null
      },
      roles: user.role ? [{
        id: user.role.id,
        nombre: user.role.nombre,
        permissions: user.role.permissions ? user.role.permissions.map(permission => ({
          id: permission.id,
          nombre: permission.nombre,
          codigo: permission.codigo
        })) : []
      }] : [],
    };
    return response;
  }

  async register(body: RegisterDTO) {
    try {
      const rol= new RoleEntity();
      rol.nombre = "Administrador";
      
      // Filtrar permisos excluyendo los de empresa directamente en la consulta
      const permisosExcluidos = [
        'empresa_ver',
        'empresa_agregar',
        'empresa_modificar',
        'empresa_eliminar',
      ];
      const permisos = await this.permissionRepository.find({
        where: { codigo: Not(In(permisosExcluidos)) }
      });
      rol.permissions = permisos;
      const empresa = new empresaEntity();
      empresa.name = body.empresa;
      const user = new UserEntity();
      Object.assign(user, body);
      user.password = hashSync(user.password, 10);
      user.empresa = empresa;
      user.role = rol;
      user.status = true;
      await this.roleRepository.save(rol);
      await this.empresaRepository.save(empresa);
      await this.userRepository.save(user);
      const userName = `${user.nombre} ${user.apellido}`;

      try {
        this.mailService.sendWelcomeMail(user.email, userName)
          .catch(err => console.error('Error enviando correo de bienvenida:', err));
      } catch (err) {
        console.error('Error inesperado al lanzar el envío de correo:', err);
      }
      return { 
        accessToken: this.jwtService.generateToken({ email: user.email }, 'auth'),
        refreshToken: this.jwtService.generateToken({ email: user.email }, 'refresh'),
      };
    } catch (error) {
      // Si es una BadRequestException, la relanzamos tal como está
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Para cualquier otro error, lanzar HttpException con status 500
      throw new HttpException('Error de creación: ' + error.message, 500);
    }
  }
  
  async createUser(createUserDTO: CreateUserDTO) {
    try {
      const { role_id, empresa_id, ...userData } = createUserDTO;
      
      const user = new UserEntity();
      Object.assign(user, userData);
      
      // Hash password
      if (userData.password) {
        user.password = hashSync(userData.password, 10);
      }
      
      // Assign role if provided
      if (role_id) {
        const role = await this.roleRepository.findOne({ where: { id: role_id } });
        if (!role) {
          throw new NotFoundException(`Rol con ID ${role_id} no encontrado`);
        }
        user.role = role;
      }
      
      // Assign empresa if provided
      if (empresa_id) {
        const empresa = await this.empresaRepository.findOne({ where: { id: empresa_id } });
        if (!empresa) {
          throw new NotFoundException(`Empresa con ID ${empresa_id} no encontrada`);
        }
        user.empresa = empresa;
      }
      
      // Set default status if not provided
      if (userData.status === undefined) {
        user.status = true;
      }
      
      const savedUser = await this.repository.save(user);
      
      // Fetch the user with relations to return complete data
      const userWithRelations = await this.repository.findOne({
        where: { id: savedUser.id },
        relations: ['role', 'empresa']
      });
      
      return userWithRelations;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      if (error.code === '23505') { // PostgreSQL unique violation error code
        throw new BadRequestException('El email ya está registrado');
      }
      throw new HttpException(`Error al crear usuario: ${error.message}`, 500);
    }
  }

  async replace(id: number, entity: any): Promise<UserEntity> {
    const existingUser = await this.repository.findOne({
      where: { id },
      relations: ['role', 'empresa']
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { role_id, empresa_id, ...userData } = entity;

    // Handle role relation
    if (role_id !== undefined) {
      if (role_id) {
        const role = await this.roleRepository.findOne({ where: { id: role_id } });
        if (role) {
          existingUser.role = role;
        }
      } else {
        existingUser.role = undefined;
      }
    }

    // Handle empresa relation
    if (empresa_id !== undefined) {
      if (empresa_id) {
        const empresa = await this.empresaRepository.findOne({ where: { id: empresa_id } });
        if (empresa) {
          existingUser.empresa = empresa;
        }
      } else {
        existingUser.empresa = undefined;
      }
    }

    // Update other fields
    Object.assign(existingUser, userData);

    // Hash password if provided
    if (userData.password) {
      existingUser.password = hashSync(userData.password, 10);
    }

    return this.repository.save(existingUser);
  }

  async login(body: LoginDTO) {
    const user = await this.findByEmail(body.email);

    if (user == null) {
      throw new UnauthorizedException();
    }
    const compareResult = compareSync(body.password, user.password);
    if (!compareResult) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    return {
      accessToken: this.jwtService.generateToken({ email: user.email }, 'auth'),
      refreshToken: this.jwtService.generateToken({ email: user.email },'refresh'),
    };
  }
  async findByEmail(email: string): Promise<UserEntity> {
    return await this.userRepository.findOne({
      where: { email },
      relations: {
        role: {
          permissions: true,
        },
        empresa: true,
      },
    });
  } 
  async findById(id: number): Promise<UserEntity> {
    return await this.repository.findOneBy({ id });
  }

  async asignarRol(userId: number, rolNombre: string, adminUser: UserEntity) {
    const user = await this.repository.findOne({ where: { id: userId }, relations: ['role'] });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const rol = await this.roleRepository.findOne({ where: { nombre: rolNombre } });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
    //Aca evitamos que un admin se modifique a sí mismo
    if (user.id === adminUser.id) {
      throw new BadRequestException('No podés cambiar tu propio rol');
    }
    user.role = rol;
    await this.repository.save(user);

    return {message: `Rol asignado correctamente a ${user.email}`,userId: user.id,nuevoRol: rol.nombre,};
  }
  async cambiarContrasena(contrasenaNueva:string, email:string) {
    try {
          const user = await this.findByEmail(email);
          if (!user) {
              throw new NotFoundException('Usuario no encontrado');
          }
          user.password = hashSync(contrasenaNueva, 10);
          await this.repository.save(user);
          
          const permissions = this.getUserPermissions(user.id);
          return { 
            accessToken: this.jwtService.generateToken({ email: user.email }, 'auth'),
            refreshToken: this.jwtService.generateToken(
              { email: user.email },
              'refresh',
            ),
            permissions: await permissions
          };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in cambiarContrasena:', error);
      throw new HttpException('Error al cambiar la contraseña', 500);
    }
  }
  async findByEmailWithRole(email: string) {
    return this.repository.findOne({
      where: { email },
      relations: ['role', 'role.permissions', 'empresa'],
    });
  }

  async updateUsersStatus(userIds: number[], status: boolean, adminUser: UserEntity) {
    
    // Verificar que los userIds sea un arreglo válido
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new BadRequestException('Se debe proporcionar al menos un ID de usuario');
    }
    
    // Convertir a números los IDs si son strings
    const numericUserIds = userIds.map(id => typeof id === 'string' ? parseInt(id) : id);
    
    // Buscar los usuarios por ID
    const users = await this.repository.find({
      where: { id: In(numericUserIds) }
    });
    
    if (users.length !== numericUserIds.length) {
      const foundIds = users.map(u => u.id);
      const missingIds = numericUserIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Algunos usuarios no fueron encontrados: ${missingIds.join(', ')}`);
    }

    // Evitamos que un usuario se desactive a sí mismo
    const adminUserId = adminUser.id;
    if (!status && numericUserIds.includes(adminUserId)) {
      throw new BadRequestException('No podés desactivar tu propia cuenta');
    }

    try {
      // Actualizar el status de todos los usuarios uno por uno para garantizar que se actualice correctamente
      for (const user of users) {
        user.status = status;
        await this.repository.save(user);
      }
      
      return {
        message: `${users.length} usuarios ${status ? 'activados' : 'desactivados'} correctamente`,
        userIds: numericUserIds,
        status: status
      };
    } catch (error) {
      console.error('Error al actualizar usuarios:', error);
      throw new HttpException(`Error al actualizar usuarios: ${error.message}`, 500);
    }
  }

  async deleteUsers(userIds: number[], adminUser: UserEntity) {
    const users = await this.repository.find({
      where: { id: In(userIds) }
    });
    if (users.length !== userIds.length) {
      throw new NotFoundException('Algunos usuarios no fueron encontrados');
    }

    // Evitamos que un usuario se elimine a sí mismo
    const adminUserId = adminUser.id;
    if (userIds.includes(adminUserId)) {
      throw new BadRequestException('No podés eliminar tu propia cuenta');
    }

    // Eliminar todos los usuarios
    await this.repository.delete(userIds);

    return {
      message: `${users.length} usuarios eliminados correctamente`,
      userIds: userIds
    };
  }
  async getUserPermissions(userId: number): Promise<string[]> {
    const user = await this.repository.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions'],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user.role ? user.role.permissions.map(p => p.codigo) : [];
  }

}