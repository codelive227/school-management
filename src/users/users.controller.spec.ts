import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { JwtAccessGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Role } from './entities/user.entity';

const mockUserService = {
  create:       jest.fn(),
  findBySchool: jest.fn(),
  findByRole:   jest.fn(),
  findOne:      jest.fn(),
  assignRole:   jest.fn(),
  update:       jest.fn(),
  remove:       jest.fn(),
};

const adminReq = { user: { userId: 1, role: Role.ADMIN, school_id: 2 } } as any;

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(JwtAccessGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it('doit être défini', () => {
    expect(controller).toBeDefined();
  });

  // ─── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('doit injecter le school_id de l\'admin et créer l\'utilisateur', async () => {
      const dto = { email: 'prof@ecole.ne', password: 'pass123', role: Role.TEACHER };
      mockUserService.create.mockResolvedValue({ id: 2, ...dto, school_id: 2 });

      await controller.create(dto as any, adminReq);

      expect(mockUserService.create).toHaveBeenCalledWith({
        ...dto,
        school_id: 2, // ← injecté depuis req.user
      });
    });
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('doit lister les users de l\'école de l\'admin', async () => {
      mockUserService.findBySchool.mockResolvedValue([]);

      await controller.findAll(adminReq);

      expect(mockUserService.findBySchool).toHaveBeenCalledWith(2);
    });
  });

  // ─── findTeachers ────────────────────────────────────────────────────────────

  describe('findTeachers', () => {
    it('doit lister les enseignants de l\'école', async () => {
      mockUserService.findByRole.mockResolvedValue([]);

      await controller.findTeachers(adminReq);

      expect(mockUserService.findByRole).toHaveBeenCalledWith(2, Role.TEACHER);
    });
  });

  // ─── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('doit retourner un utilisateur par ID', async () => {
      const user = { id: 5, email: 'test@test.com' };
      mockUserService.findOne.mockResolvedValue(user);

      const result = await controller.findOne(5);

      expect(mockUserService.findOne).toHaveBeenCalledWith(5);
      expect(result).toEqual(user);
    });
  });

  // ─── assignRole ──────────────────────────────────────────────────────────────

  describe('assignRole', () => {
    it('doit attribuer un rôle à un utilisateur', async () => {
      mockUserService.assignRole.mockResolvedValue({
        message: "Rôle 'TEACHER' attribué à l'utilisateur #5",
      });

      const result = await controller.assignRole(5, { role: Role.TEACHER });

      expect(mockUserService.assignRole).toHaveBeenCalledWith(5, Role.TEACHER);
      expect(result.message).toContain('TEACHER');
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('doit modifier un utilisateur', async () => {
      const updated = { id: 5, email: 'new@test.com' };
      mockUserService.update.mockResolvedValue(updated);

      const result = await controller.update(5, { email: 'new@test.com' } as any);

      expect(mockUserService.update).toHaveBeenCalledWith(5, { email: 'new@test.com' });
      expect(result).toEqual(updated);
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('doit supprimer un utilisateur', async () => {
      mockUserService.remove.mockResolvedValue(undefined);

      await controller.remove(5);

      expect(mockUserService.remove).toHaveBeenCalledWith(5);
    });
  });
});