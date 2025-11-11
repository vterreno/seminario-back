import { ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { JwtExceptionFilter } from './jwt.exception.filter';

describe('JwtExceptionFilter', () => {
  let filter: JwtExceptionFilter;
  let response: { status: jest.Mock; json: jest.Mock };
  let host: ArgumentsHost;

  const createHost = (): ArgumentsHost => ({
    switchToHttp: () => ({
      getResponse: () => response,
    }),
  } as unknown as ArgumentsHost);

  beforeEach(() => {
    filter = new JwtExceptionFilter();
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    host = createHost();
  });

  it('handles TokenExpiredError with 401', () => {
    const error = new TokenExpiredError('expired', new Date());

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Access token expired' });
  });

  it('handles JsonWebTokenError with 401', () => {
    const error = new JsonWebTokenError('invalid token');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Invalid token' });
  });

  it('handles UnauthorizedException with custom message', () => {
    const error = new UnauthorizedException('Custom');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith({ message: 'Custom' });
  });

  it('falls back to 500 for unexpected errors', () => {
    const error = new Error('unexpected');

    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
