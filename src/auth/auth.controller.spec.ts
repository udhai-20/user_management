import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../users/entities/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(dto => Promise.resolve({ id: 1, ...dto })),
    login: jest.fn(user => Promise.resolve({ access_token: 'mock-jwt-token' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto: CreateUserDto = { firstName:"test",lastName:"case",email: 'test@example.com', password: 'password', role: UserRole.VIEWER };
      expect(await authController.register(dto)).toEqual({
        id: 1,
        firstName:dto.firstName,
        lastName:dto.lastName,
        email: dto.email,
        password: dto.password,
        role: UserRole.VIEWER,
      });
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login a user and set a cookie', async () => {
      const req = { user: { email: 'test@example.com', id: 1, role: 'viewer' } };
      const res = {
        cookie: jest.fn(),
        send: jest.fn(),
      };

      (mockAuthService.login as jest.Mock).mockImplementation(async (user, response) => {
        response.cookie('access_token', 'mocked_token', {
          httpOnly: true,
          secure: true,
          sameSite: 'None',
           domain: '.onrender.com',
          maxAge: 1000 * 60 * 60 * 24,
        });
        response.send({ user });
      });

      await authController.login(req, res as any);

      expect(mockAuthService.login).toHaveBeenCalledWith(req.user, res);
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'mocked_token',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60 * 24,
        }
      );
      expect(res.send).toHaveBeenCalledWith({ user: req.user });
    });
  });

  describe('logout', () => {
    it('should clear the cookie and log out', async () => {
      const res = { clearCookie: jest.fn(), json: jest.fn() };

      await authController.logout(res);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token', expect.any(Object));
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });

  
});
