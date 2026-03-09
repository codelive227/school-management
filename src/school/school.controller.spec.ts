import { Test, TestingModule } from '@nestjs/testing';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { School } from './entities/school.entity';

const mockSchoolRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('SchoolController', () => {
  let controller: SchoolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchoolController],
      providers: [
        SchoolService,
        { provide: getRepositoryToken(School), useValue: mockSchoolRepository },
      ],
    }).compile();

    controller = module.get<SchoolController>(SchoolController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create() should create a school', async () => {
    const dto = { name: 'École A' } as any;
    mockSchoolRepository.create.mockReturnValue(dto);
    mockSchoolRepository.save.mockResolvedValue({ id: 1, ...dto });
    const result = await controller.create(dto);
    expect(result).toHaveProperty('id', 1);
  });

  it('findAll() should return all schools', async () => {
    mockSchoolRepository.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await controller.findAll();
    expect(result).toHaveLength(2);
  });

  it('findOne() should return a school by id', async () => {
    mockSchoolRepository.findOne.mockResolvedValue({ id: 1 });
    const result = await controller.findOne('1');
    expect(result).toHaveProperty('id', 1);
  });

  it('update() should update a school', async () => {
    const dto = { name: 'École B' } as any;
    mockSchoolRepository.update.mockResolvedValue(undefined);
    mockSchoolRepository.findOne.mockResolvedValue({ id: 1, ...dto });
    const result = await controller.update('1', dto);
    expect(result).toHaveProperty('name', 'École B');
  });

  it('remove() should delete a school', async () => {
    mockSchoolRepository.delete.mockResolvedValue({ affected: 1 });
    const result = await controller.remove('1');
    expect(mockSchoolRepository.delete).toHaveBeenCalledWith(1);
  });
});
