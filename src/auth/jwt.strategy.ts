// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'hardcoded_secret_key', // Use the same secret as JwtModule
    });
  }

  async validate(payload: any) {
    return { 
      sub: payload.sub, 
      email: payload.email, 
      isAdmin: payload.isAdmin,
      role: payload.role 
    };
  }
}
