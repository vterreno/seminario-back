import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/core/user.entity';
import { RoleEntity } from 'src/database/core/roles.entity';
import { empresaEntity } from 'src/database/core/empresa.entity';
import { sucursalEntity } from 'src/database/core/sucursal.entity';
import { PermissionEntity } from 'src/database/core/permission.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { MailServiceService } from '../mail-service/mail-service.service';
import { ContactosService } from '../contactos/contactos.service';
import { BadRequestException, HttpException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<UserEntity>;
  let roleRepository: Repository<RoleEntity>;
  let empresaRepository: Repository<empresaEntity>;
  let permissionRepository: Repository<PermissionEntity>;
  let jwtService: JwtService;
  let mailService: MailServiceService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockEmpresaRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockPermissionRepository = {
    find: jest.fn(),
  };

  const mockJwtService = {
    generateToken: jest.fn(),
    refreshToken: jest.fn(),
  };

  const mockMailService = {
    sendWelcomeMail: jest.fn(),
  };

  const resetAllMocks = () => {
    const repositories = [
      mockUserRepository,
      mockRoleRepository,
      mockEmpresaRepository,
      mockPermissionRepository,
    ];
    repositories.forEach(repo => {
      Object.values(repo).forEach(fn => {
        if (typeof fn?.mockReset === 'function') {
          fn.mockReset();
        }
      });
    });

    Object.values(mockJwtService).forEach(fn => {
      if (typeof fn?.mockReset === 'function') {
        fn.mockReset();
      }
    });

    Object.values(mockMailService).forEach(fn => {
      if (typeof fn?.mockReset === 'function') {
        fn.mockReset();
      }
    });

    (bcrypt.hashSync as jest.Mock).mockReset();
    (bcrypt.compareSync as jest.Mock).mockReset();
  };

  const mockUser: UserEntity = {
    id: 1,
    email: 'test@test.com',
    password: 'hashedPassword',
    nombre: 'Test',
    apellido: 'User',
    status: true,
    role: {
      id: 1,
      nombre: 'Admin',
      permissions: [
        { id: 1, nombre: 'Ver', codigo: 'ver' } as PermissionEntity,
      ],
    } as RoleEntity,
    empresa: {
      id: 1,
      name: 'Test Empresa',
    } as empresaEntity,
    sucursales: [],
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  } as UserEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(empresaEntity),
          useValue: mockEmpresaRepository,
        },
        {
          provide: getRepositoryToken(PermissionEntity),
          useValue: mockPermissionRepository,
        },
        {
          provide: getRepositoryToken(sucursalEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailServiceService,
          useValue: mockMailService,
        },
        {
          provide: ContactosService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            crearConsumidorFinal: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    roleRepository = module.get<Repository<RoleEntity>>(getRepositoryToken(RoleEntity));
    empresaRepository = module.get<Repository<empresaEntity>>(getRepositoryToken(empresaEntity));
    permissionRepository = module.get<Repository<PermissionEntity>>(getRepositoryToken(PermissionEntity));
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailServiceService>(MailServiceService);

    resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refreshToken', () => {
    it('delegates token refresh', async () => {
      mockJwtService.refreshToken.mockResolvedValue('new-refresh');

      await expect(service.refreshToken('old-refresh')).resolves.toBe('new-refresh');
      expect(mockJwtService.refreshToken).toHaveBeenCalledWith('old-refresh');
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const loginDTO = {
        email: 'test@test.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      mockJwtService.generateToken.mockReturnValue('token');

      const result = await service.login(loginDTO);

      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: 'token',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDTO = {
        email: 'test@test.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDTO)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDTO = {
        email: 'test@test.com',
        password: 'wrongpassword',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false);

      await expect(service.login(loginDTO)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a new user with empresa', async () => {
      const registerDTO = {
        email: 'newuser@test.com',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        empresa: 'New Company',
      };

      const mockPermissions = [
        { id: 1, codigo: 'test_permission' },
      ] as PermissionEntity[];

      mockPermissionRepository.find.mockResolvedValue(mockPermissions);
      mockRoleRepository.save.mockResolvedValue({} as RoleEntity);
      mockEmpresaRepository.save.mockResolvedValue({} as empresaEntity);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');
      mockJwtService.generateToken.mockReturnValue('token');
      mockMailService.sendWelcomeMail.mockResolvedValue(undefined);

      const result = await service.register(registerDTO);

      expect(result).toEqual({
        accessToken: 'token',
        refreshToken: 'token',
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockMailService.sendWelcomeMail).toHaveBeenCalled();
    });

    it('should handle mail service errors gracefully', async () => {
      const registerDTO = {
        email: 'newuser@test.com',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        empresa: 'New Company',
      };

      const mockPermissions = [
        { id: 1, codigo: 'test_permission' },
      ] as PermissionEntity[];

      mockPermissionRepository.find.mockResolvedValue(mockPermissions);
      mockRoleRepository.save.mockResolvedValue({} as RoleEntity);
      mockEmpresaRepository.save.mockResolvedValue({} as empresaEntity);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');
      mockJwtService.generateToken.mockReturnValue('token');
      mockMailService.sendWelcomeMail.mockRejectedValue(new Error('Mail error'));

      const result = await service.register(registerDTO);

      expect(result).toBeDefined();
    });

    it('should rethrow BadRequestException from dependencies', async () => {
      const registerDTO = {
        email: 'newuser@test.com',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        empresa: 'New Company',
      };

      mockPermissionRepository.find.mockRejectedValue(new BadRequestException('Permisos inválidos'));

      await expect(service.register(registerDTO)).rejects.toThrow(BadRequestException);
      expect(mockRoleRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('me', () => {
    it('should return user information', async () => {
      const userI: any = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@test.com',
        empresa: {
          id: 1,
          name: 'Test Empresa',
        },
        role: {
          id: 1,
          nombre: 'Admin',
          permissions: [
            { id: 1, nombre: 'Ver', codigo: 'ver' },
          ],
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.me(userI);

      expect(result).toEqual({
        name: 'Test User',
        email: 'test@test.com',
        empresa: {
          id: 1,
          nombre: 'Test Empresa',
        },
        roles: [{
          id: 1,
          nombre: 'Admin',
          permissions: [
            { id: 1, nombre: 'Ver', codigo: 'ver' },
          ],
        }],
      });
    });

    it('should handle user without empresa', async () => {
      const userI: any = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@test.com',
        empresa: null,
        role: null,
      };

      const mockUserWithoutEmpresa = {
        ...mockUser,
        empresa: null,
        role: null,
        sucursales: [],
      };
      mockUserRepository.findOne.mockResolvedValue(mockUserWithoutEmpresa);

      const result = await service.me(userI);

      expect(result.empresa).toEqual({ id: null, nombre: null });
      expect(result.roles).toEqual([]);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDTO = {
        email: 'newuser@test.com',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        role_id: 1,
        empresa_id: 1,
      };

      const mockRole = { id: 1, nombre: 'Admin' } as RoleEntity;
      const mockEmpresa = { id: 1, name: 'Test Empresa' } as empresaEntity;

      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockEmpresaRepository.findOne.mockResolvedValue(mockEmpresa);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashedPassword');

      const result = await service.createUser(createUserDTO);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if role not found', async () => {
      const createUserDTO = {
        email: 'newuser@test.com',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        role_id: 999,
        empresa_id: 1,
      };

      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.createUser(createUserDTO)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if empresa not found', async () => {
      const createUserDTO = {
        email: 'newuser@test.com',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        role_id: 1,
        empresa_id: 999,
      };

      const mockRole = { id: 1, nombre: 'Admin' } as RoleEntity;
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockEmpresaRepository.findOne.mockResolvedValue(null);

      await expect(service.createUser(createUserDTO)).rejects.toThrow(NotFoundException);
    });

    it('should translate unique violation into BadRequestException', async () => {
      const createUserDTO = {
        email: 'existing@test.com',
        password: 'password123',
        nombre: 'Dup',
        apellido: 'User',
      };

      mockUserRepository.save.mockRejectedValue({ code: '23505', message: 'duplicate key' });

      await expect(service.createUser(createUserDTO as any)).rejects.toThrow(BadRequestException);
    });

    it('should wrap unexpected errors when creating user', async () => {
      const createUserDTO = {
        email: 'error@test.com',
        password: 'password123',
        nombre: 'Err',
        apellido: 'User',
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      mockUserRepository.save.mockRejectedValue(new Error('db fail'));

      await expect(service.createUser(createUserDTO as any)).rejects.toThrow(HttpException);

      consoleSpy.mockRestore();
    });
  });

  describe('replace', () => {
    it('throws NotFoundException when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.replace(1, {})).rejects.toThrow(NotFoundException);
    });

    it('updates relations and password when provided', async () => {
      const existingUser = {
        ...mockUser,
        role: { id: 2 } as RoleEntity,
        empresa: { id: 3 } as empresaEntity,
      } as UserEntity;

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockRoleRepository.findOne.mockResolvedValue({ id: 5, nombre: 'Manager' });
      mockEmpresaRepository.findOne.mockResolvedValue({ id: 7, name: 'New Empresa' });
      (bcrypt.hashSync as jest.Mock).mockReturnValue('hashed-new');
      mockUserRepository.save.mockImplementation(async user => user);

      const payload = {
        role_id: 5,
        empresa_id: 7,
        password: 'newPass123',
        nombre: 'Updated',
      };

      const result = await service.replace(existingUser.id, payload);

      expect(mockRoleRepository.findOne).toHaveBeenCalledWith({ where: { id: 5 } });
      expect(mockEmpresaRepository.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.role?.id).toBe(5);
      expect(result.empresa?.id).toBe(7);
      expect(result.password).toBe('hashed-new');
      expect(result.nombre).toBe('Updated');
    });

    it('clears relations when identifiers are falsy', async () => {
      const existingUser = {
        ...mockUser,
        role: { id: 2 } as RoleEntity,
        empresa: { id: 3 } as empresaEntity,
      } as UserEntity;

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockUserRepository.save.mockImplementation(async user => user);

      const payload = {
        role_id: 0,
        empresa_id: 0,
        status: false,
      };

      const result = await service.replace(existingUser.id, payload);

      expect(result.role).toBeUndefined();
      expect(result.empresa).toBeUndefined();
      expect(result.status).toBe(false);
      expect(mockRoleRepository.findOne).not.toHaveBeenCalled();
      expect(mockEmpresaRepository.findOne).not.toHaveBeenCalled();
    });

    it('retains existing relations when new lookups fail', async () => {
      const existingUser = {
        ...mockUser,
        role: { id: 2 } as RoleEntity,
        empresa: { id: 3 } as empresaEntity,
      } as UserEntity;

      mockUserRepository.findOne.mockResolvedValue(existingUser);
      mockRoleRepository.findOne.mockResolvedValueOnce(null);
      mockEmpresaRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.save.mockImplementation(async user => user);

      const payload = {
        role_id: 99,
        empresa_id: 88,
      };

      const result = await service.replace(existingUser.id, payload);

      expect(result.role?.id).toBe(2);
      expect(result.empresa?.id).toBe(3);
    });
  });

  describe('finders', () => {
    it('findByEmail returns user with relations', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.findByEmail('test@test.com')).resolves.toBe(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
        relations: {
          role: { permissions: true },
          empresa: true,
          sucursales: true,
        },
      });
    });

    it('findById delegates to repository', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.findById(1)).resolves.toBe(mockUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('findByEmailWithRole includes relations', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.findByEmailWithRole('test@test.com')).resolves.toBe(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@test.com' },
        relations: ['role', 'role.permissions', 'empresa', 'sucursales'],
      });
    });
  });

  describe('asignarRol', () => {
    it('should assign a role to a user', async () => {
      const userId = 2;
      const rolNombre = 'Editor';
      const adminUser = mockUser;

      const targetUser = { ...mockUser, id: userId };
      const newRole = { id: 2, nombre: 'Editor' } as RoleEntity;

      mockUserRepository.findOne.mockResolvedValue(targetUser);
      mockRoleRepository.findOne.mockResolvedValue(newRole);
      mockUserRepository.save.mockResolvedValue(targetUser);

      const result = await service.asignarRol(userId, rolNombre, adminUser);

      expect(result).toEqual({
        message: `Rol asignado correctamente a ${targetUser.email}`,
        userId: targetUser.id,
        nuevoRol: rolNombre,
      });
    });

    it('should throw BadRequestException if user tries to change own role', async () => {
      const userId = 1;
      const rolNombre = 'Editor';
      const adminUser = mockUser;

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockRoleRepository.findOne.mockResolvedValue({ id: 2, nombre: 'Editor' } as RoleEntity);

      await expect(service.asignarRol(userId, rolNombre, adminUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 999;
      const rolNombre = 'Editor';
      const adminUser = mockUser;

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.asignarRol(userId, rolNombre, adminUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if role not found', async () => {
      const userId = 2;
      const rolNombre = 'NonExistentRole';
      const adminUser = mockUser;

      const targetUser = { ...mockUser, id: userId };
      mockUserRepository.findOne.mockResolvedValue(targetUser);
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(service.asignarRol(userId, rolNombre, adminUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUsersStatus', () => {
    it('should update status of multiple users', async () => {
      const userIds = [2, 3];
      const status = false;
      const adminUser = mockUser;

      const mockUsers = [
        { ...mockUser, id: 2 },
        { ...mockUser, id: 3 },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);
      mockUserRepository.save.mockResolvedValue({});

      const result = await service.updateUsersStatus(userIds, status, adminUser);

      expect(result).toEqual({
        message: '2 usuarios desactivados correctamente',
        userIds: userIds,
        status: status,
      });
    });

    it('should throw BadRequestException if user tries to deactivate themselves', async () => {
      const userIds = [1, 2];
      const status = false;
      const adminUser = mockUser;

      mockUserRepository.find.mockResolvedValue([mockUser, { ...mockUser, id: 2 }]);

      await expect(service.updateUsersStatus(userIds, status, adminUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if no userIds provided', async () => {
      const userIds: number[] = [];
      const status = false;
      const adminUser = mockUser;

      await expect(service.updateUsersStatus(userIds, status, adminUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if some users not found', async () => {
      const userIds = [1, 2, 999];
      const status = false;
      const adminUser = mockUser;

      mockUserRepository.find.mockResolvedValue([mockUser, { ...mockUser, id: 2 }]);

      await expect(service.updateUsersStatus(userIds, status, adminUser)).rejects.toThrow(NotFoundException);
    });

    it('should wrap unexpected errors while updating status', async () => {
      const userIds = [2];
      const status = true;
      const adminUser = mockUser;

      mockUserRepository.find.mockResolvedValue([{ ...mockUser, id: 2 }]);
      mockUserRepository.save.mockRejectedValue(new Error('db fail'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      await expect(service.updateUsersStatus(userIds, status, adminUser)).rejects.toThrow(HttpException);

      consoleSpy.mockRestore();
    });

    it('should coerce string user IDs before processing', async () => {
      const userIds = ['2', '3'] as unknown as number[];
      const status = true;
      const adminUser = mockUser;

      const foundUsers = [
        { ...mockUser, id: 2 },
        { ...mockUser, id: 3 },
      ];

      mockUserRepository.find.mockResolvedValue(foundUsers);
      mockUserRepository.save.mockResolvedValue({});

      const result = await service.updateUsersStatus(userIds, status, adminUser);

      expect(result.userIds).toEqual([2, 3]);
      expect(result.message).toBe('2 usuarios activados correctamente');
    });
  });

  describe('deleteUsers', () => {
    it('should delete multiple users', async () => {
      const userIds = [2, 3];
      const adminUser = mockUser;

      const mockUsers = [
        { ...mockUser, id: 2 },
        { ...mockUser, id: 3 },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);
      mockUserRepository.delete.mockResolvedValue({ affected: 2 });

      const result = await service.deleteUsers(userIds, adminUser);

      expect(result).toEqual({
        message: '2 usuarios eliminados correctamente',
        userIds: userIds,
      });
    });

    it('should throw BadRequestException if user tries to delete themselves', async () => {
      const userIds = [1, 2];
      const adminUser = mockUser;

      mockUserRepository.find.mockResolvedValue([mockUser, { ...mockUser, id: 2 }]);

      await expect(service.deleteUsers(userIds, adminUser)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if some users not found', async () => {
      const userIds = [2, 999];
      const adminUser = mockUser;

      mockUserRepository.find.mockResolvedValue([{ ...mockUser, id: 2 }]);

      await expect(service.deleteUsers(userIds, adminUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('canDo', () => {
    it('should return true if user has the permission', () => {
      const userI: any = {
        permissionCodes: ['ver', 'modificar', 'eliminar'],
      };

      const result = service.canDo(userI, 'ver');

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if user does not have the permission', () => {
      const userI: any = {
        permissionCodes: ['ver'],
      };

      expect(() => service.canDo(userI, 'eliminar')).toThrow(UnauthorizedException);
    });

    it('should handle comma-separated permissions', () => {
      const userI: any = {
        permissionCodes: ['ver', 'modificar'],
      };

      const result = service.canDo(userI, 'ver,agregar');

      expect(result).toBe(true);
    });
  });

  describe('cambiarContrasena', () => {
    it('should change user password', async () => {
      const email = 'test@test.com';
      const newPassword = 'newPassword123';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      (bcrypt.hashSync as jest.Mock).mockReturnValue('newHashedPassword');
      mockJwtService.generateToken.mockReturnValue('token');

      // Mock getUserPermissions
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.cambiarContrasena(newPassword, email);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      const email = 'nonexistent@test.com';
      const newPassword = 'newPassword123';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.cambiarContrasena(newPassword, email)).rejects.toThrow(NotFoundException);
    });

    it('should wrap errors when saving fails', async () => {
      const email = 'error@test.com';
      const newPassword = 'newPassword123';

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockRejectedValue(new Error('db fail'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      await expect(service.cambiarContrasena(newPassword, email)).rejects.toThrow(HttpException);

      consoleSpy.mockRestore();
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      const userId = 1;
      const userWithPermissions = {
        ...mockUser,
        role: {
          ...mockUser.role,
          permissions: [
            { id: 1, codigo: 'ver' },
            { id: 2, codigo: 'modificar' },
          ] as PermissionEntity[],
        },
      };

      mockUserRepository.findOne.mockResolvedValue(userWithPermissions);

      const result = await service.getUserPermissions(userId);

      expect(result).toEqual(['ver', 'modificar']);
    });

    it('should return empty array if user has no role', async () => {
      const userId = 1;
      const userWithoutRole = {
        ...mockUser,
        role: null,
      };

      mockUserRepository.findOne.mockResolvedValue(userWithoutRole);

      const result = await service.getUserPermissions(userId);

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 999;

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getUserPermissions(userId)).rejects.toThrow(NotFoundException);
    });
  });
});
