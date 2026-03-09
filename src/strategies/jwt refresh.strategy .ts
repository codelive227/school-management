import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'), // ✅
      passReqToCallback: true,
    } as any);
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) throw new UnauthorizedException('Refresh token manquant');
    return { userId: payload.sub, role: payload.role, refreshToken };
  }
}