import { Injectable, UnauthorizedException } from '@nestjs/common';
import { sign, verify } from 'jsonwebtoken';
import * as dayjs from 'dayjs';
import { Payload } from 'src/jwt/interface/payload';
@Injectable()
export class JwtService {
  // config.ts
  config = {
    auth: {
      secret: 'authSecret',
      expiresIn: '15m',
    },
    refresh: {
      secret: 'refreshSecret',
      expiresIn: '1d',
    },
  };
  generateToken(payload: { email: string }, type: 'refresh' | 'auth' = 'auth'): string {
    const token = sign(payload, this.config[type].secret, {
      expiresIn: this.config[type].expiresIn,
    });
    return token;
  }
  refreshToken(refreshToken: string): { accessToken: string, refreshToken: string } {
    try {
      const payload = this.getPayload(refreshToken, 'refresh');  
      const timeToExpire = dayjs.unix(payload.exp).diff(dayjs(), 'minute');
      return {
        accessToken: this.generateToken({ email: payload.email }),
        refreshToken: timeToExpire < 20
          ? this.generateToken({ email: payload.email }, 'refresh')
          : refreshToken
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
  

  getPayload(token: string, type: 'refresh' | 'auth' = 'auth'): Payload {
    try {
      const decoded = verify(token, this.config[type].secret);
      if (typeof decoded === 'string') {
        throw new UnauthorizedException('Token inválido');
      }
      return decoded as Payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
  
}
