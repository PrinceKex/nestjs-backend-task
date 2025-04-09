import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginBiometricsDto } from './dto/login.biometrics.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

// Mock user data
const mockUser = {
  id: 1,
  email: 'test@example.com',
  password: 'hashed_password',
  //biometricKey: 'biometric_key',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

// Mock JwtService
const mockJwtService = {
  sign: jest.fn().mockReturnValue('jwt-token'),
};

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue(mockUser.password),
  // hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(authService.register(registerDto)).rejects.toThrow(
        new ConflictException(
          'User already exists! Please try with a different email',
        ),
      );
    });

    it('should register a new user and return user data without password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null); // User doesn't exist
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      const result = await authService.register(registerDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          password: registerDto.password,
        },
      });
      expect(result).toEqual({
        id: 1,
        email: mockUser.email,
        biometricKey: 'biometric_key',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials! Please try again'),
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      //(bcrypt.compare as jest.Mock) = compare;
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials! Please try again'),
      );
    });

    it('should return user data with JWT token if login is successful', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await authService.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        biometricKey: 'biometric_key',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        token: 'jwt-token',
      });
    });
  });

  describe('loginWithBiometrics', () => {
    it('should throw UnauthorizedException if biometricKey is not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const loginBiometricsDto: LoginBiometricsDto = {
        biometricKey: 'invalid_bio_key',
      };

      await expect(
        authService.loginWithBiometrics(loginBiometricsDto),
      ).rejects.toThrow(
        new UnauthorizedException('Invalid credentials! Please try again'),
      );
    });

    it('should return user data with JWT token if login is successful', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const loginBiometricsDto: LoginBiometricsDto = {
        biometricKey: 'biometric_key',
      };

      const result = await authService.loginWithBiometrics(loginBiometricsDto);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { biometricKey: loginBiometricsDto.biometricKey },
      });
      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        biometricKey: 'biometric_key',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        token: 'jwt-token',
      });
    });
  });
});
