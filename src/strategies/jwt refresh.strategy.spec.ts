import { Test, TestingModule } from '@nestjs/testing';
import { JwtRefreshStrategy } from './jwt refresh.strategy ';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_REFRESH_SECRET') return 'test_refresh_secret';
    return null;
  }),
};

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
    jest.clearAllMocks();
  });

  it('doit être défini', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('doit retourner userId, role, school_id et refreshToken', async () => {
      const req = { body: { refreshToken: 'mon_refresh_token' } } as any;
      const payload = { sub: 1, role: 'TEACHER', school_id: 3 };

      const result = await strategy.validate(req, payload);

      expect(result).toEqual({
        userId:       1,
        role:         'TEACHER',
        school_id:    3,
        refreshToken: 'mon_refresh_token',
      });
    });

    it('doit lever UnauthorizedException si refreshToken absent du body', async () => {
      const req = { body: {} } as any;
      const payload = { sub: 1, role: 'TEACHER', school_id: 3 };

      await expect(strategy.validate(req, payload))
        .rejects.toThrow(UnauthorizedException);
    });

    it('doit lever UnauthorizedException si body est vide', async () => {
      const req = { body: { refreshToken: '' } } as any;
      const payload = { sub: 1, role: 'ADMIN', school_id: 1 };

      await expect(strategy.validate(req, payload))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});