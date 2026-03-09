import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../users/users.controller';
import { UserService } from '../users/users.service';

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create() should call userService.create', async () => {
    const dto = { email: 'a@a.com', password: 'pass', school_id: 1, role: 'student' } as any;
    mockUserService.create.mockResolvedValue({ id: 1, ...dto });
    const result = await controller.create(dto);
    expect(mockUserService.create).toHaveBeenCalledWith(dto);
    expect(result).toHaveProperty('id', 1);
  });

  it('findAll() should return array of users', async () => {
    mockUserService.findAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await controller.findAll();
    expect(result).toHaveLength(2);
  });

  it('findOne() should return a single user', async () => {
    mockUserService.findOne.mockResolvedValue({ id: 1 });
    const result = await controller.findOne(1);
    expect(mockUserService.findOne).toHaveBeenCalledWith(1);
    expect(result).toHaveProperty('id', 1);
  });

  it('update() should call userService.update', async () => {
    const dto = { email: 'b@b.com' } as any;
    mockUserService.update.mockResolvedValue({ id: 1, ...dto });
    const result = await controller.update(1, dto);
    expect(mockUserService.update).toHaveBeenCalledWith(1, dto);
    expect(result).toHaveProperty('email', 'b@b.com');
  });

  it('remove() should call userService.remove', async () => {
    mockUserService.remove.mockResolvedValue(undefined);
    await controller.remove(1);
    expect(mockUserService.remove).toHaveBeenCalledWith(1);
  });
});
