import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';

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

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;


  const mockUserRepository = {
    find: jest.fn().mockResolvedValue([mockUser]),
    findOne: jest.fn().mockResolvedValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockReturnValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    await expect(service.findAll()).resolves.toEqual([mockUser]);
    expect(repository.find).toHaveBeenCalled();
  });

  it('should return one user by id', async () => {
    await expect(service.findOne('1')).resolves.toEqual(mockUser);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should return one user by email', async () => {
    await expect(service.findByEmail('test@example.com')).resolves.toEqual(mockUser);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
  });

  it('should update a user', async () => {
    const updateUserDto = { email: 'updated@example.com' };
    await expect(service.update('1', updateUserDto)).resolves.toEqual(mockUser);
    expect(repository.save).toHaveBeenCalled();
  });

  it('should remove a user', async () => {
    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalled();
  });

  it('should update user role', async () => {
    await expect(service.updateRole('1', UserRole.ADMIN)).resolves.toEqual(mockUser);
    expect(repository.save).toHaveBeenCalled();
  });

  

  it('should throw error if user already exists', async () => {
    repository.findOne = jest.fn().mockResolvedValue(mockUser);
    const createUserDto = {firstName:"test",lastName:"case", email: 'test@example.com', password: 'password123' };

    await expect(service.create(createUserDto)).rejects.toThrow('Email already exists');
  });
});
