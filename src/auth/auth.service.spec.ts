import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/entities/user.entity';


describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(email => 
      Promise.resolve(email === 'test@example.com' ? { id: 1, email, password: bcrypt.hashSync('password', 10), role: 'viewer' } : null)
    ),
    create: jest.fn(dto => Promise.resolve({ id: 1, ...dto })),
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mock-jwt-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user and return user data', async () => {
      const email = 'test@example.com';
      const password = 'password';

      const user = await authService.validateUser(email, password);
      expect(user).toHaveProperty('id', 1);
      expect(user).toHaveProperty('email', email);
      expect(user).not.toHaveProperty('password');
    });

    it('should return null if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      const user = await authService.validateUser(email, password);
      expect(user).toBeNull();
    });

    it('should return null if user is not found', async () => {
      const user = await authService.validateUser('notfound@example.com', 'password');
      expect(user).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token and set a cookie', async () => {
      const user = { id: 1, email: 'test@example.com', role: 'viewer' };
      const res = { cookie: jest.fn(), send: jest.fn() };

      await authService.login(user, res);

      expect(jwtService.sign).toHaveBeenCalledWith({ email: user.email, sub: user.id, role: user.role });
      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock-jwt-token',
        expect.any(Object),
      );
      expect(res.send).toHaveBeenCalledWith({ user });
    });
  });

  describe('register', () => {
    it('should create a new user and return user data without password', async () => {
      const dto = { firstName:"test",lastName:"case", email: 'newuser@example.com', password: 'password', role:UserRole.VIEWER };
      const user = await authService.register(dto);

      expect(user).toHaveProperty('id', 1);
      expect(user).toHaveProperty('email', dto.email);
      expect(user).not.toHaveProperty('password');
    });
  });
});
