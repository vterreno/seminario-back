import { UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtService } from './jwt.service';

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
    service = new JwtService();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('generates an auth token that can be decoded', () => {
    const token = service.generateToken({ email: 'user@example.com' });
    const payload = service.getPayload(token);

    expect(payload.email).toBe('user@example.com');
  });

  it('refreshes tokens generating a new refresh token when close to expiry', () => {
    service.config.refresh.expiresIn = '10m';
    const refreshToken = service.generateToken({ email: 'user@example.com' }, 'refresh');
    jest.advanceTimersByTime(1000);

    const result = service.refreshToken(refreshToken);

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).not.toBe(refreshToken);
    expect(service.getPayload(result.accessToken).email).toBe('user@example.com');
  });

  it('returns the same refresh token when it is still far from expiring', () => {
    service.config.refresh.expiresIn = '2h';
    const refreshToken = service.generateToken({ email: 'user@example.com' }, 'refresh');

    const result = service.refreshToken(refreshToken);

    expect(result.refreshToken).toBe(refreshToken);
  });

  it('throws unauthorized when refresh token verification fails', () => {
    expect(() => service.refreshToken('invalid-token')).toThrow(UnauthorizedException);
  });

  it('throws unauthorized when verify returns a string payload', () => {
    const verifySpy = jest.spyOn(jwt, 'verify').mockReturnValue('invalid' as any);

    expect(() => service.getPayload('token')).toThrow(new UnauthorizedException('Token inválido'));

    verifySpy.mockRestore();
  });

  it('throws unauthorized when verify throws an error', () => {
    const verifySpy = jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('failed');
    });

    expect(() => service.getPayload('token')).toThrow(new UnauthorizedException('Token inválido'));

    verifySpy.mockRestore();
  });
});
