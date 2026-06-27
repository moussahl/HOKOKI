import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../database/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const mockUser = {
  id: 'u1',
  email: 'test@example.com',
  fullName: 'Test User',
  passwordHash: 'hashed-pw',
  role: UserRole.CITIZEN,
  preferredLanguage: 'ar',
  isVerifiedExpert: false,
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-pw'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'new@example.com',
      fullName: 'New User',
      password: 'password123',
      preferredLanguage: 'fr',
    };

    it('should register a new user', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        fullName: 'New User',
        passwordHash: 'hashed-pw',
        preferredLanguage: 'fr',
      });
    });

    it('should throw ConflictException if email exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
