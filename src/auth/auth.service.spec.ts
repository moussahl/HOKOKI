import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../database/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const mockUser = {
  id: 'uuid-1',
  email: 'test@example.com',
  fullName: 'Test User',
  passwordHash: 'hashed',
  role: UserRole.CITIZEN,
  preferredLanguage: 'ar',
  isVerifiedExpert: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  conversations: [],
  interests: [],
  procedureProgress: [],
  notifications: [],
  requestedExpertSessions: [],
  expertSessions: [],
};

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('signed-token'),
};

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

  describe('register', () => {
    it('creates a user and returns a token when email is new', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
      });

      expect(result.accessToken).toBe('signed-token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@example.com', fullName: 'X', password: 'password123' }),
      ).rejects.toThrow(ConflictException);

      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns a token when credentials are valid', async () => {
      const passwordHash = await bcrypt.hash('password123', 10);
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, passwordHash });

      const result = await service.login({ email: 'test@example.com', password: 'password123' });

      expect(result.accessToken).toBe('signed-token');
    });

    it('throws UnauthorizedException when user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, passwordHash });

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
