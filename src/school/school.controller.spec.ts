import { Test, TestingModule } from '@nestjs/testing';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { JwtAccessGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';

const mockSchoolService = {
  create:  jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update:  jest.fn(),
  remove:  jest.fn(),
};

const mockSchool = {
  id:      1,
  name:    'Complexe Scolaire Al Azhar',
  address: 'Niamey, Niger',
};

describe('SchoolController', () => {
  let controller: SchoolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolController],
      providers: [{ provide: SchoolService, useValue: mockSchoolService }],
    })
      .overrideGuard(JwtAccessGuard).useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard).useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SchoolController>(SchoolController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('doit créer une école', async () => {
      mockSchoolService.create.mockResolvedValue(mockSchool);

      const dto = { name: 'Complexe Scolaire Al Azhar', address: 'Niamey, Niger' };
      const result = await controller.create(dto as any);

      expect(mockSchoolService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockSchool);
    });
  });

  describe('findAll', () => {
    it('doit retourner la liste des écoles', async () => {
      mockSchoolService.findAll.mockResolvedValue([mockSchool]);

      const result = await controller.findAll();

      expect(mockSchoolService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('doit retourner une école par ID', async () => {
      mockSchoolService.findOne.mockResolvedValue(mockSchool);

      // ✅ number, pas string
      const result = await controller.findOne(1);

      expect(mockSchoolService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSchool);
    });
  });

  describe('update', () => {
    it('doit modifier une école', async () => {
      const dto = { name: 'Nouveau Nom' };
      mockSchoolService.update.mockResolvedValue({ ...mockSchool, ...dto });

      // ✅ number, pas string
      const result = await controller.update(1, dto as any);

      expect(mockSchoolService.update).toHaveBeenCalledWith(1, dto);
      expect(result.name).toBe('Nouveau Nom');
    });
  });

  describe('remove', () => {
    it('doit supprimer une école', async () => {
      mockSchoolService.remove.mockResolvedValue(undefined);

      // ✅ number, pas string
      await controller.remove(1);

      expect(mockSchoolService.remove).toHaveBeenCalledWith(1);
    });
  });
});