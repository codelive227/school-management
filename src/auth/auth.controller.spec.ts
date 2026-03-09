import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// ─── Mock AuthService ─────────────────────────────────────────────────────────
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  refreshTokens: jest.fn(),
  getMe: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ─── register ────────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('doit appeler authService.register et retourner le message de succès', async () => {
      mockAuthService.register.mockResolvedValue({ message: 'Utilisateur créé avec succès' });

      const dto = { email: 'test@test.com', password: 'pass123', school_id: 1 } as any;
      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith('test@test.com', 'pass123', 1);
      expect(result).toEqual({ message: 'Utilisateur créé avec succès' });
    });
  });

  // ─── login ───────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('doit appeler authService.login et retourner les tokens', async () => {
      const tokens = { accessToken: 'acc', refreshToken: 'ref', user: { id: 1 } };
      mockAuthService.login.mockResolvedValue(tokens);

      const dto = { email: 'test@test.com', password: 'pass123' } as any;
      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith('test@test.com', 'pass123');
      expect(result).toEqual(tokens);
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('doit appeler authService.logout avec le userId extrait de req', async () => {
      mockAuthService.logout.mockResolvedValue({ message: 'Déconnexion réussie' });

      const mockReq = { user: { userId: 42 } } as any;
      const result = await controller.logout(mockReq);

      expect(mockAuthService.logout).toHaveBeenCalledWith(42);
      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });
  });

  // ─── refresh ─────────────────────────────────────────────────────────────────

  describe('refresh()', () => {
    it('doit appeler authService.refreshTokens avec userId et refreshToken', async () => {
      const tokens = { accessToken: 'new_acc', refreshToken: 'new_ref' };
      mockAuthService.refreshTokens.mockResolvedValue(tokens);

      const mockReq = { user: { userId: 42, refreshToken: 'old_ref' } } as any;
      const result = await controller.refresh(mockReq);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(42, 'old_ref');
      expect(result).toEqual(tokens);
    });
  });

  // ─── getMe ───────────────────────────────────────────────────────────────────

  describe('getMe()', () => {
    it('doit appeler authService.getMe avec le userId et retourner le profil', async () => {
      const profile = { id: 42, email: 'test@test.com', role: 'student' };
      mockAuthService.getMe.mockResolvedValue(profile);

      const mockReq = { user: { userId: 42 } } as any;
      const result = await controller.getMe(mockReq);

      expect(mockAuthService.getMe).toHaveBeenCalledWith(42);
      expect(result).toEqual(profile);
    });
  });
});
