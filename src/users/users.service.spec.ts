import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service'; // ✅ UserService (singulier)
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, Role } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

// ─── Mock du repository ───────────────────────────────────────────────────────
const mockUserRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

// ─── Données de test ──────────────────────────────────────────────────────────
const mockUser: User = {
  id: 1,
  email: 'test@test.com',
  password_hash: 'hashed_password',
  role: Role.STUDENT,
  school_id: 1,
  refresh_token: null,
  school: { id: 1, name: 'École Test' } as any,
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

  // ─── findAll ─────────────────────────────────────────────────────────────────
  // userRepository.find({ relations: ['school'] })

  describe('findAll', () => {
    it('doit retourner la liste de tous les utilisateurs', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(mockUserRepository.find).toHaveBeenCalledWith({ relations: ['school'] });
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe('test@test.com');
    });

    it('doit retourner un tableau vide si aucun utilisateur', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────────
  // userRepository.findOne({ where: { id }, relations: ['school'] })
  // lève NotFoundException si null

  describe('findOne', () => {
    it('doit retourner un utilisateur par son ID', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['school'],
      });
      expect(result.email).toBe('test@test.com');
    });

    it('doit lever NotFoundException si l\'utilisateur est introuvable', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── create ──────────────────────────────────────────────────────────────────
  // { password, ...rest } = dto → bcrypt.hash(password) → create({ ...rest, password_hash })
  // ⚠️ le DTO doit avoir un champ 'password' (pas 'password_hash')

  describe('create', () => {
    it('doit hasher le mot de passe et créer l\'utilisateur', async () => {
      const createDto = { email: 'new@test.com', password: 'pass123', school_id: 1 };
      const createdUser = { ...mockUser, email: createDto.email };

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createDto as any);

      // Vérifie que create() a reçu un password_hash et PAS le mot de passe en clair
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'new@test.com',
          school_id: 1,
          password_hash: expect.any(String), // bcrypt hash
        }),
      );
      // Vérifie que le mot de passe en clair n'est PAS stocké
      expect(mockUserRepository.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ password: 'pass123' }),
      );
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.email).toBe('new@test.com');
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────
  // findOne(id) → Object.assign(user, ...) → save()
  // si password fourni → bcrypt.hash avant assign

  describe('update', () => {
    it('doit mettre à jour l\'email sans toucher au mot de passe', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({ ...mockUser, email: 'updated@test.com' });

      const result = await service.update(1, { email: 'updated@test.com' } as any);

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.email).toBe('updated@test.com');
    });

    it('doit hasher le nouveau mot de passe si fourni', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockImplementation((user) => Promise.resolve(user));

      await service.update(1, { password: 'nouveauMotDePasse' } as any);

      const savedUser = mockUserRepository.save.mock.calls[0][0];
      // Le password en clair ne doit pas être dans l'objet sauvegardé
      expect(savedUser).not.toHaveProperty('password');
      // Un nouveau hash doit être présent
      expect(savedUser).toHaveProperty('password_hash');
      expect(savedUser.password_hash).not.toBe('hashed_password'); // différent de l'ancien
    });

    it('doit lever NotFoundException si l\'utilisateur est introuvable', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────
  // findOne(id) → remove(user)
  // lève NotFoundException via findOne si introuvable

  describe('remove', () => {
    it('doit supprimer l\'utilisateur trouvé', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });

    it('doit lever NotFoundException si l\'utilisateur est introuvable', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});