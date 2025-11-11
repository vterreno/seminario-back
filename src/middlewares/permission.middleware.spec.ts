import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permission.middleware';

const createContext = (request: any): ExecutionContext => ({
  switchToHttp: () => ({ getRequest: () => request }),
  getHandler: jest.fn(),
  getClass: jest.fn(),
}) as unknown as ExecutionContext;

describe('PermissionsGuard', () => {
  let reflector: { get: jest.Mock };
  let guard: PermissionsGuard;

  beforeEach(() => {
    reflector = { get: jest.fn() };
    guard = new PermissionsGuard(reflector as unknown as Reflector);
  });

  it('allows access when no metadata is defined', () => {
    reflector.get.mockReturnValueOnce(undefined);
    const result = guard.canActivate(createContext({}));
    expect(result).toBe(true);
  });

  it('throws unauthorized when user is missing', () => {
    reflector.get.mockReturnValueOnce('leer').mockReturnValueOnce('cliente');

    expect(() => guard.canActivate(createContext({}))).toThrow(
      new UnauthorizedException('Usuario no autenticado'),
    );
  });

  it('throws forbidden when user lacks role', () => {
    reflector.get.mockReturnValueOnce('leer').mockReturnValueOnce('cliente');
    const request = { user: {} };

    expect(() => guard.canActivate(createContext(request))).toThrow(
      new ForbiddenException('Usuario sin rol asignado'),
    );
  });

  it('throws forbidden when role is inactive', () => {
    reflector.get.mockReturnValueOnce('leer').mockReturnValueOnce('cliente');
    const request = { user: { role: { estado: false } } };

    expect(() => guard.canActivate(createContext(request))).toThrow(
      new ForbiddenException('El rol no está activo'),
    );
  });

  it('throws forbidden when permission is missing', () => {
    reflector.get.mockReturnValueOnce('crear').mockReturnValueOnce('cliente');
    const request = { user: { role: { estado: true, permissions: [{ codigo: 'cliente_ver' }] } } };

    expect(() => guard.canActivate(createContext(request))).toThrow(
      new ForbiddenException("No tienes permiso para realizar la acción 'crear' en 'cliente'"),
    );
  });

  it('allows access when permission exists', () => {
    reflector.get.mockReturnValueOnce('crear').mockReturnValueOnce('cliente');
    const request = { user: { role: { estado: true, permissions: [{ codigo: 'CLIENTE_CREAR' }] } } };

    const result = guard.canActivate(createContext(request));

    expect(result).toBe(true);
  });
});
