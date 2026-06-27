import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserInterest } from '../database/entities/user-interest.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { InterestsService } from './interests.service';

const mockUser = { id: 'u1', role: UserRole.CITIZEN } as User;
const mockInterest = {
  id: 'int1',
  user: mockUser,
  topic: 'labor',
  isSubscribed: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('InterestsService', () => {
  let service: InterestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterestsService,
        { provide: getRepositoryToken(UserInterest), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<InterestsService>(InterestsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUser', () => {
    it('should return all interests for a user', async () => {
      mockRepository.find.mockResolvedValue([mockInterest]);
      const result = await service.findByUser('u1');
      expect(result).toEqual([mockInterest]);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 'u1' } },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('create', () => {
    it('should create a new interest', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockInterest);
      mockRepository.save.mockResolvedValue(mockInterest);

      const result = await service.create(mockUser, { topic: 'labor' });
      expect(result).toEqual(mockInterest);
    });

    it('should throw ConflictException if topic already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockInterest);
      await expect(
        service.create(mockUser, { topic: 'labor' }),
      ).rejects.toThrow('already exists');
    });
  });

  describe('update', () => {
    it('should update interest subscription', async () => {
      const updated = { ...mockInterest, isSubscribed: false };
      mockRepository.findOne.mockResolvedValue(mockInterest);
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.update('int1', 'u1', { isSubscribed: false });
      expect(result.isSubscribed).toBe(false);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(
        service.update('nonexistent', 'u1', { isSubscribed: false }),
      ).rejects.toThrow('Interest not found');
    });
  });

  describe('delete', () => {
    it('should delete an interest', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });
      await service.delete('int1', 'u1');
      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: 'int1',
        user: { id: 'u1' },
      });
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete('nonexistent', 'u1')).rejects.toThrow('Interest not found');
    });
  });
});
