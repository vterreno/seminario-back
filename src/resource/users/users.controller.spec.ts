import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEntity } from 'src/database/core/user.entity';
import { RequestWithUser } from './interface/request-user';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let mockService: {
    me: jest.Mock;
    login: jest.Mock;
    register: jest.Mock;
    createUser: jest.Mock;
    canDo: jest.Mock;
    refreshToken: jest.Mock;
    asignarRol: jest.Mock;
    cambiarContrasena: jest.Mock;
    updateUsersStatus: jest.Mock;
    deleteUsers: jest.Mock;
  };

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    nombre: 'Test',
    apellido: 'User',
    status: true,
    empresa: { id: 1, name: 'Test Empresa' },
    role: { id: 1, nombre: 'Admin' },
    permissionCodes: ['user_ver', 'user_crear', 'user_modificar', 'user_eliminar'],
  };

  const mockRequest: Partial<RequestWithUser> = {
    user: mockUser as any,
    headers: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockService = {
      me: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      createUser: jest.fn(),
      canDo: jest.fn(),
      refreshToken: jest.fn(),
      asignarRol: jest.fn(),
      cambiarContrasena: jest.fn(),
      updateUsersStatus: jest.fn(),
      deleteUsers: jest.fn(),
    };

    controller = new UsersController(mockService as unknown as UsersService);
    service = mockService as unknown as UsersService;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('me', () => {
    it('should return current user information', async () => {
      const mockUserInfo = {
        name: 'Test User',
        email: 'test@test.com',
        empresa: { id: 1, nombre: 'Test Empresa' },
        roles: [],
      };

      mockService.me.mockResolvedValue(mockUserInfo);

      const result = await controller.me(mockRequest as RequestWithUser);

      expect(result).toEqual(mockUserInfo);
      expect(mockService.me).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('login', () => {
    it('should return tokens on successful login', async () => {
      const loginDTO = {
        email: 'test@test.com',
        password: 'password123',
      };

      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      mockService.login.mockResolvedValue(tokens);

      const result = await controller.login(loginDTO);

      expect(result).toEqual(tokens);
      expect(mockService.login).toHaveBeenCalledWith(loginDTO);
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDTO = {
        email: 'newuser@test.com',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        empresa: 'New Company',
      };

      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      };

      mockService.register.mockResolvedValue(tokens);

      const result = await controller.register(registerDTO);

      expect(result).toEqual(tokens);
      expect(mockService.register).toHaveBeenCalledWith(registerDTO);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'newuser@test.com',
        password: 'password123',
        nombre: 'New',
        apellido: 'User',
        role_id: 1,
        empresa_id: 1,
      };

      const newUser = {
        id: 2,
        email: createUserDto.email,
        nombre: createUserDto.nombre,
        apellido: createUserDto.apellido,
        status: true,
      } as unknown as UserEntity;

      mockService.createUser.mockResolvedValue(newUser);

      const result = await controller.createUser(createUserDto, mockRequest as RequestWithUser);

      expect(result).toEqual(newUser);
      expect(mockService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('canDo', () => {
    it('should check if user has permission', async () => {
      const permission = 'user_ver';

      mockService.canDo.mockReturnValue(true);

      const result = await controller.canDo(mockRequest as RequestWithUser, permission);

      expect(result).toBe(true);
      expect(mockService.canDo).toHaveBeenCalledWith(mockUser, permission);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshToken = 'refresh_token';
      const mockRequestWithToken = {
        ...mockRequest,
        headers: {
          'refresh-token': refreshToken,
        },
      };

      const newTokens = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      };

      mockService.refreshToken.mockResolvedValue(newTokens);

      const result = await controller.refreshToken(mockRequestWithToken as any);

      expect(result).toEqual(newTokens);
      expect(mockService.refreshToken).toHaveBeenCalledWith(refreshToken);
    });
  });

  describe('asignarRol', () => {
    it('should assign a role to a user', async () => {
      const userId = 2;
      const rol = 'Editor';

      const response = {
        message: 'Rol asignado correctamente a test@test.com',
        userId: userId,
        nuevoRol: rol,
      };

      mockService.asignarRol.mockResolvedValue(response);

      const result = await controller.asignarRol(userId, rol, mockRequest as RequestWithUser);

      expect(result).toEqual(response);
      expect(mockService.asignarRol).toHaveBeenCalledWith(userId, rol, mockUser);
    });
  });

  describe('cambiarContrasena', () => {
    it('should change user password', async () => {
      const contrasena = 'newPassword123';
      const email = 'test@test.com';

      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        permissions: ['user_ver'],
      };

      mockService.cambiarContrasena.mockResolvedValue(tokens);

      const result = await controller.cambiarContrasena(contrasena, email);

      expect(result).toEqual(tokens);
      expect(mockService.cambiarContrasena).toHaveBeenCalledWith(contrasena, email);
    });
  });

  describe('validateToken', () => {
    it('should validate token and return user info', async () => {
      const result = await controller.validateToken(mockRequest as RequestWithUser);

      expect(result).toEqual({
        valid: true,
        user: {
          email: mockUser.email,
          id: mockUser.id,
        }
      });
    });
  });

  describe('updateUsersStatus', () => {
    it('should update status of multiple users', async () => {
      const userIds = [2, 3];
      const status = false;

      const response = {
        message: '2 usuarios desactivados correctamente',
        userIds: userIds,
        status: status,
      };

      mockService.updateUsersStatus.mockResolvedValue(response);

      const result = await controller.updateUsersStatus(userIds, status, mockRequest as RequestWithUser);

      expect(result).toEqual(response);
      expect(mockService.updateUsersStatus).toHaveBeenCalledWith(userIds, status, mockUser);
    });
  });

  describe('deleteUsers', () => {
    it('should delete multiple users', async () => {
      const userIds = [2, 3];

      const response = {
        message: '2 usuarios eliminados correctamente',
        userIds: userIds,
      };

      mockService.deleteUsers.mockResolvedValue(response);

      const result = await controller.deleteUsers(userIds, mockRequest as RequestWithUser);

      expect(result).toEqual(response);
      expect(mockService.deleteUsers).toHaveBeenCalledWith(userIds, mockUser);
    });
  });
});
