import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginBiometricsDto } from './dto/login.biometrics.dto';

// Mock user object returned by service
const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  password: 'hashed_password',
  biometricKey: 'some-bio-key',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock AuthService
const mockAuthService = {
  register: jest.fn().mockResolvedValue(mockUser),
  login: jest.fn().mockResolvedValue(mockUser),
  loginWithBiometrics: jest.fn().mockResolvedValue(mockUser),
};

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should call register mutation and return user', async () => {
    const input: RegisterDto = {
      email: 'test@example.com',
      password: 'secret123',
      //biometricKey: 'some-bio-key',
    };

    const result = await resolver.register(input);
    expect(authService.register).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockUser);
  });

  it('should call login mutation and return user', async () => {
    const input: LoginDto = {
      email: 'test@example.com',
      password: 'secret123',
    };

    const result = await resolver.login(input);
    expect(authService.login).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockUser);
  });

  it('should call loginWithBiometrics mutation and return user', async () => {
    const input: LoginBiometricsDto = {
      biometricKey: 'some-bio-key',
    };

    const result = await resolver.loginWithBiometrics(input);
    expect(authService.loginWithBiometrics).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockUser);
  });

  // Testing the show() query (even though it's a placeholder)
  it('should return placeholder message from show query', async () => {
    const result = await resolver.show();
    expect(result).toBe('This will be updated to return all users');
  });
});
