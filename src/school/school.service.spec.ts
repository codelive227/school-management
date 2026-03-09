import { Test, TestingModule } from '@nestjs/testing';
import { SchoolService } from './school.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { School } from './entities/school.entity';

// ─── Mock aligné sur les méthodes réellement utilisées par SchoolService ──────
// create → save         (create)
// find                  (findAll)
// findOne               (findOne, update via findOne)
// update + findOne      (update)
// delete                (remove)
const mockSchoolRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockSchool: Partial<School> = {
  id: 1,
  name: 'École Primaire Test',
};

describe('SchoolService', () => {
  let service: SchoolService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchoolService,
        { provide: getRepositoryToken(School), useValue: mockSchoolRepository },
      ],
    }).compile();

    service = module.get<SchoolService>(SchoolService);
    jest.clearAllMocks();
  });

  // ─── create ──────────────────────────────────────────────────────────────────
  // schoolRepo.create(dto) → schoolRepo.save(school)

  describe('create', () => {
    it('doit créer et retourner une école', async () => {
      const dto = { name: 'Nouvelle École' };
      mockSchoolRepository.create.mockReturnValue({ id: 2, ...dto });
      mockSchoolRepository.save.mockResolvedValue({ id: 2, ...dto });

      const result = await service.create(dto as any);

      expect(mockSchoolRepository.create).toHaveBeenCalledWith(dto);
      expect(mockSchoolRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Nouvelle École');
    });
  });

  // ─── findAll ─────────────────────────────────────────────────────────────────
  // schoolRepo.find({ relations: ['users', 'classrooms'] })

  describe('findAll', () => {
    it('doit retourner la liste avec les relations users et classrooms', async () => {
      mockSchoolRepository.find.mockResolvedValue([mockSchool]);

      const result = await service.findAll();

      expect(mockSchoolRepository.find).toHaveBeenCalledWith({
        relations: ['users', 'classrooms'],
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('École Primaire Test');
    });

    it('doit retourner un tableau vide si aucune école', async () => {
      mockSchoolRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────────
  // schoolRepo.findOne({ where: { id }, relations: ['users', 'classrooms'] })
  // ⚠️ le service ne lève pas de NotFoundException — il retourne null si absent

  describe('findOne', () => {
    it('doit retourner une école avec ses relations', async () => {
      mockSchoolRepository.findOne.mockResolvedValue(mockSchool);

      const result = await service.findOne(1);

      expect(mockSchoolRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['users', 'classrooms'],
      });
      expect(result.name).toBe('École Primaire Test');
    });

    it('doit retourner null si l\'école est introuvable', async () => {
      mockSchoolRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  // ─── update ──────────────────────────────────────────────────────────────────
  // schoolRepo.update(id, dto) → this.findOne(id)

  describe('update', () => {
    it('doit appeler update puis retourner l\'école mise à jour', async () => {
      const updatedSchool = { ...mockSchool, name: 'École Modifiée' };
      mockSchoolRepository.update.mockResolvedValue(undefined);
      mockSchoolRepository.findOne.mockResolvedValue(updatedSchool);

      const result = await service.update(1, { name: 'École Modifiée' } as any);

      expect(mockSchoolRepository.update).toHaveBeenCalledWith(1, { name: 'École Modifiée' });
      expect(result.name).toBe('École Modifiée');
    });

    it('doit retourner null si l\'école est introuvable après update', async () => {
      mockSchoolRepository.update.mockResolvedValue(undefined);
      mockSchoolRepository.findOne.mockResolvedValue(null);

      const result = await service.update(999, {} as any);

      expect(result).toBeNull();
    });
  });

  // ─── remove ──────────────────────────────────────────────────────────────────
  // schoolRepo.delete(id) — pas de findOne, pas de NotFoundException

  describe('remove', () => {
    it('doit supprimer l\'école par son ID', async () => {
      mockSchoolRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockSchoolRepository.delete).toHaveBeenCalledWith(1);
    });

    it('doit retourner affected: 0 si l\'école est introuvable', async () => {
      mockSchoolRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.remove(999);

      expect(result).toEqual({ affected: 0 });
    });
  });
});