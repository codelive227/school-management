import { Test, TestingModule } from '@nestjs/testing';
import { JwtAccessStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'JWT_ACCESS_SECRET') return 'test_access_secret';
    return null;
  }),
};

describe('JwtAccessStrategy', () => {
  let strategy: JwtAccessStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAccessStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtAccessStrategy>(JwtAccessStrategy);
    jest.clearAllMocks();
  });

  it('doit être défini', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('doit retourner userId, role et school_id depuis le payload', async () => {
      const result = await strategy.validate({ sub: 1, role: 'ADMIN', school_id: 2 });
      expect(result).toEqual({ userId: 1, role: 'ADMIN', school_id: 2 });
    });

    it('doit retourner school_id null si absent du payload', async () => {
      const result = await strategy.validate({ sub: 1, role: 'STUDENT', school_id: null });
      expect(result.school_id).toBeNull();
    });

    it('doit mapper sub vers userId', async () => {
      const result = await strategy.validate({ sub: 42, role: 'TEACHER', school_id: 5 });
      expect(result.userId).toBe(42);
    });
  });
});