import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// Mock user data for the tests
const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashed_password',
  //biometricKey: 'biometric_key',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

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
    it('should successfully register a user', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      // Mock the AuthService's register method to return mockUser
      mockAuthService.register.mockResolvedValue(mockUser);

      const result = await authController.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockUser);
    });

    it('should throw a ConflictException if user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock the AuthService's register method to throw a ConflictException
      mockAuthService.register.mockRejectedValue(
        new ConflictException('User already exists!'),
      );

      await expect(authController.register(registerDto)).rejects.toThrow(
        new ConflictException('User already exists!'),
      );
    });
  });

  describe('login', () => {
    it('should successfully login a user and return token', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginResponse = {
        ...mockUser,
        token: 'jwt-token',
      };

      // Mock the AuthService's login method to return loginResponse
      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await authController.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(loginResponse);
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      // Mock the AuthService's login method to throw UnauthorizedException
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials!'),
      );

      await expect(authController.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials!'),
      );
    });
  });
});
