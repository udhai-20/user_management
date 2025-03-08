import { Test, TestingModule } from '@nestjs/testing';
import { CustomRequest, UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';


const mockUser: User = {
  id: '1',
  firstName: "test",
  lastName: "name",
  email: 'test@example.com',
  password: 'hashedpassword',
  role: UserRole.VIEWER,
  documents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let req:CustomRequest

  const mockUsersService = {
    findAll: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue(undefined),
    updateRole: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return an array of users', async () => {
    await expect(controller.findAll()).resolves.toEqual([mockUser]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return a single user', async () => {
    await expect(controller.findOne('1',req)).resolves.toEqual(mockUser);
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should update a user', async () => {
    const updateUserDto = { email: 'updated@example.com' };
    await expect(controller.update('1', updateUserDto)).resolves.toEqual(mockUser);
    expect(service.update).toHaveBeenCalledWith('1', updateUserDto);
  });

  it('should delete a user', async () => {
    await expect(controller.remove('1')).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith('1');
  });

  it('should update user role', async () => {
    await expect(controller.updateRole('1', UserRole.ADMIN)).resolves.toEqual(mockUser);
    expect(service.updateRole).toHaveBeenCalledWith('1', UserRole.ADMIN);
  });
});
