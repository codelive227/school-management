import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Role } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

const mockUserRepository = {
  find:    jest.fn(),
  findOne: jest.fn(),
  create:  jest.fn(),
  save:    jest.fn(),
  update:  jest.fn(),
  remove:  jest.fn(),
};

const mockUser: Partial<User> = {
  id:            1,
  email:         'test@test.com',
  password_hash: 'hashed_password',
  role:          Role.STUDENT,
  school_id:     2,
  refresh_token: null,
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('doit hasher le mot de passe et créer l\'utilisateur', async () => {
      const dto = { email: 'new@test.com', password: 'pass123', school_id: 2, role: Role.TEACHER };
      mockUserRepository.create.mockReturnValue({ ...mockUser, email: dto.email });
      mockUserRepository.save.mockResolvedValue({ ...mockUser, email: dto.email });

      const result = await service.create(dto as any);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email:         'new@test.com',
          password_hash: expect.any(String),
        }),
      );
      expect(mockUserRepository.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ password: 'pass123' }),
      );
      expect(result.email).toBe('new@test.com');
    });
  });

  // ─── assignRole ──────────────────────────────────────────────────────────────

  describe('assignRole', () => {
    it('doit changer le rôle d\'un utilisateur', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(undefined);

      const result = await service.assignRole(1, Role.TEACHER);

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, { role: Role.TEACHER });
      expect(result.message).toContain('TEACHER');
    });

    it('doit lever NotFoundException si l\'utilisateur est introuvable', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.assignRole(999, Role.TEACHER))
        .rejects.toThrow(NotFoundException);
    });
  });

  // ─── findBySchool ─────────────────────────────────────────────────────────────

  describe('findBySchool', () => {
    it('doit retourner les users d\'une école', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findBySchool(2);

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { school_id: 2 },
        relations: ['school'],
      });
      expect(result).toHaveLength(1);
    });
  });

  // ─── findByRole ──────────────────────────────────────────────────────────────

  describe('findByRole', () => {
    it('doit retourner les users par rôle dans une école', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findByRole(2, Role.TEACHER);

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { school_id: 2, role: Role.TEACHER },
      });
      expect(result).toHaveLength(1);
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('doit retourner un utilisateur par ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['school'],
      });
      expect(result.email).toBe('test@test.com');
    });

    it('doit lever NotFoundException si introuvable', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('doit mettre à jour sans toucher au mot de passe', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({ ...mockUser, email: 'updated@test.com' });

      const result = await service.update(1, { email: 'updated@test.com' } as any);

      expect(result.email).toBe('updated@test.com');
    });

    it('doit hasher le nouveau mot de passe si fourni', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockImplementation((u) => Promise.resolve(u));

      await service.update(1, { password: 'nouveauPass' } as any);

      const saved = mockUserRepository.save.mock.calls[0][0];
      expect(saved).not.toHaveProperty('password');
      expect(saved.password_hash).not.toBe('hashed_password');
    });

    it('doit lever NotFoundException si introuvable', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('doit supprimer l\'utilisateur', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('doit lever NotFoundException si introuvable', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});