import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../database/entities/user.entity';
import { UsersService } from './users.service';

const mockUser = {
  id: 'u1',
  email: 'test@example.com',
  fullName: 'Test User',
  passwordHash: 'hashed',
  role: UserRole.CITIZEN,
  preferredLanguage: 'ar',
  isVerifiedExpert: false,
};

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findByEmail('notfound@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findById('u1');
      expect(result).toEqual(mockUser);
    });

    it('should return null when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a user', async () => {
      const input = {
        email: 'NEW@EXAMPLE.COM',
        fullName: 'New User',
        passwordHash: 'hashed-pw',
      };
      const createdUser = { ...mockUser, email: 'new@example.com' };
      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(input);
      expect(result).toEqual(createdUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        fullName: 'New User',
        passwordHash: 'hashed-pw',
        preferredLanguage: 'ar',
        role: UserRole.CITIZEN,
      });
    });

    it('should apply custom role and language', async () => {
      const input = {
        email: 'expert@example.com',
        fullName: 'Expert',
        passwordHash: 'hashed',
        preferredLanguage: 'fr',
        role: UserRole.EXPERT,
      };
      const createdUser = { ...mockUser, ...input, email: 'expert@example.com' };
      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(input);
      expect(result).toEqual(createdUser);
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: 'expert@example.com',
        fullName: 'Expert',
        passwordHash: 'hashed',
        preferredLanguage: 'fr',
        role: UserRole.EXPERT,
      });
    });
  });
});
