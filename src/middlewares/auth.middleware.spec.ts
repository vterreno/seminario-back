import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.middleware';

const createContext = (request: any): ExecutionContext => ({
  switchToHttp: () => ({
    getRequest: () => request,
  }),
  getHandler: jest.fn(),
  getClass: jest.fn(),
}) as unknown as ExecutionContext;

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: { getPayload: jest.Mock };
  let usersService: { findByEmailWithRole: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    jwtService = { getPayload: jest.fn() };
    usersService = { findByEmailWithRole: jest.fn() };
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    guard = new AuthGuard(jwtService as any, usersService as any, reflector as unknown as Reflector);
  });

  it('allows access to public routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const request: any = { headers: {} };

    const result = await guard.canActivate(createContext(request));

    expect(result).toBe(true);
    expect(jwtService.getPayload).not.toHaveBeenCalled();
  });

  it('throws when authorization header is missing', async () => {
    const request: any = { headers: {} };

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      new UnauthorizedException('El token no existe o es inválido'),
    );
  });

  it('throws when user is not found', async () => {
    const request: any = { headers: { authorization: 'Bearer token' } };
    jwtService.getPayload.mockReturnValue({ email: 'test@example.com' });
    usersService.findByEmailWithRole.mockResolvedValue(null);

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      new UnauthorizedException('Usuario no encontrado'),
    );
  });

  it('throws when user is inactive', async () => {
    const request: any = { headers: { authorization: 'Bearer token' } };
    jwtService.getPayload.mockReturnValue({ email: 'test@example.com' });
    usersService.findByEmailWithRole.mockResolvedValue({ status: false });

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      new UnauthorizedException('Usuario inactivo'),
    );
  });

  it('throws when user role is inactive', async () => {
    const request: any = { headers: { authorization: 'Bearer token' } };
    jwtService.getPayload.mockReturnValue({ email: 'test@example.com' });
    usersService.findByEmailWithRole.mockResolvedValue({ status: true, role: { estado: false } });

    await expect(guard.canActivate(createContext(request))).rejects.toThrow(
      new UnauthorizedException('El rol del usuario está inactivo'),
    );
  });

  it('allows active users and attaches user to request', async () => {
    const user = { status: true, role: { estado: true } };
    const request: any = { headers: { authorization: 'Bearer token' } };
    jwtService.getPayload.mockReturnValue({ email: 'active@example.com' });
    usersService.findByEmailWithRole.mockResolvedValue(user);

    const result = await guard.canActivate(createContext(request));

    expect(result).toBe(true);
    expect(request.user).toBe(user);
  });
});
