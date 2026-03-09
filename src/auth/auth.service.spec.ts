import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Role } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// ─── Mock du repository User ──────────────────────────────────────────────────
const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

// ─── Mock du JwtService ───────────────────────────────────────────────────────
const mockJwtService = {
  signAsync: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  // ─── hashPassword ────────────────────────────────────────────────────────────

  describe('hashPassword', () => {
    it('doit retourner un hash bcrypt', async () => {
      const hash = await service.hashPassword('monMotDePasse');
      expect(hash).toBeDefined();
      expect(hash).not.toBe('monMotDePasse');
      const isValid = await bcrypt.compare('monMotDePasse', hash);
      expect(isValid).toBe(true);
    });
  });

  // ─── validatePassword ─────────────────────────────────────────────────────────

  describe('validatePassword', () => {
    it('doit retourner true si le mot de passe correspond au hash', async () => {
      const hash = await bcrypt.hash('monMotDePasse', 10);
      const result = await service.validatePassword('monMotDePasse', hash);
      expect(result).toBe(true);
    });

    it('doit retourner false si le mot de passe ne correspond pas', async () => {
      const hash = await bcrypt.hash('monMotDePasse', 10);
      const result = await service.validatePassword('mauvaisMotDePasse', hash);
      expect(result).toBe(false);
    });
  });

  // ─── register ────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('doit créer un utilisateur avec succès', async () => {
      mockUserRepository.findOne.mockResolvedValue(null); // email pas encore utilisé
      mockUserRepository.create.mockReturnValue({ id: 1, email: 'test@test.com' });
      mockUserRepository.save.mockResolvedValue({ id: 1, email: 'test@test.com' });

      const result = await service.register('test@test.com', 'password123', 1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@test.com' } });
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Utilisateur créé avec succès' });
    });

    it('doit lever ConflictException si l\'email existe déjà', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, email: 'test@test.com' });

      await expect(service.register('test@test.com', 'password123', 1))
        .rejects.toThrow(ConflictException);
    });
  });

  // ─── login ───────────────────────────────────────────────────────────────────

  describe('login', () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      role: Role.STUDENT,
      password_hash: '',
    };

    beforeEach(async () => {
      mockUser.password_hash = await bcrypt.hash('password123', 10);
    });

    it('doit retourner les tokens si les identifiants sont corrects', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(undefined);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access_token_mock')
        .mockResolvedValueOnce('refresh_token_mock');

      const result = await service.login('test@test.com', 'password123');

      expect(result).toHaveProperty('accessToken', 'access_token_mock');
      expect(result).toHaveProperty('refreshToken', 'refresh_token_mock');
      expect(result.user).toEqual({ id: 1, email: 'test@test.com', role: Role.STUDENT });
    });

    it('doit lever UnauthorizedException si l\'email est introuvable', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login('inconnu@test.com', 'password123'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('doit lever UnauthorizedException si le mot de passe est incorrect', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.login('test@test.com', 'mauvaisMotDePasse'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── logout ──────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('doit mettre refresh_token à null en base', async () => {
      mockUserRepository.update.mockResolvedValue(undefined);

      const result = await service.logout(1);

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, { refresh_token: null });
      expect(result).toEqual({ message: 'Déconnexion réussie' });
    });
  });

  // ─── refreshTokens ───────────────────────────────────────────────────────────

  describe('refreshTokens', () => {
    it('doit retourner de nouveaux tokens si le refresh token est valide', async () => {
      const rawRefreshToken = 'valid_refresh_token';
      const hashedToken = await bcrypt.hash(rawRefreshToken, 10);

      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        role: Role.STUDENT,
        refresh_token: hashedToken,
      });
      mockUserRepository.update.mockResolvedValue(undefined);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new_access_token')
        .mockResolvedValueOnce('new_refresh_token');

      const result = await service.refreshTokens(1, rawRefreshToken);

      expect(result).toHaveProperty('accessToken', 'new_access_token');
      expect(result).toHaveProperty('refreshToken', 'new_refresh_token');
    });

    it('doit lever UnauthorizedException si refresh_token est null (déconnecté)', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1, refresh_token: null });

      await expect(service.refreshTokens(1, 'some_token'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('doit lever UnauthorizedException si le token ne correspond pas', async () => {
      const hashedToken = await bcrypt.hash('bon_token', 10);
      mockUserRepository.findOne.mockResolvedValue({ id: 1, refresh_token: hashedToken });

      await expect(service.refreshTokens(1, 'mauvais_token'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  // ─── getMe ───────────────────────────────────────────────────────────────────

  describe('getMe', () => {
    it('doit retourner le profil sans password_hash ni refresh_token', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        role: Role.STUDENT,
        school_id: 1,
        password_hash: 'hash_secret',
        refresh_token: 'refresh_secret',
        school: { id: 1, name: 'École Test' },
      });

      const result = await service.getMe(1);

      expect(result).not.toHaveProperty('password_hash');
      expect(result).not.toHaveProperty('refresh_token');
      expect(result).toHaveProperty('email', 'test@test.com');
    });

    it('doit lever UnauthorizedException si l\'utilisateur est introuvable', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getMe(999)).rejects.toThrow(UnauthorizedException);
    });
  });
});