import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ExpertSession, ExpertSessionStatus } from '../database/entities/expert-session.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { ExpertSessionsService } from './expert-sessions.service';

const mockCitizen = { id: 'u1', role: UserRole.CITIZEN } as User;
const mockExpert = { id: 'u2', role: UserRole.EXPERT, isVerifiedExpert: true } as User;
const mockAdmin = { id: 'u3', role: UserRole.ADMIN } as User;
const mockOther = { id: 'u4', role: UserRole.CITIZEN } as User;

const mockSession = {
  id: 's1',
  citizen: mockCitizen,
  expert: null,
  topic: 'Labor rights',
  notes: null,
  status: ExpertSessionStatus.REQUESTED,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSessionWithExpert = {
  ...mockSession,
  expert: mockExpert,
  status: ExpertSessionStatus.CONFIRMED,
};

const mockSessionRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockUserRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
};

describe('ExpertSessionsService', () => {
  let service: ExpertSessionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpertSessionsService,
        { provide: getRepositoryToken(ExpertSession), useValue: mockSessionRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<ExpertSessionsService>(ExpertSessionsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a session', async () => {
      mockSessionRepository.create.mockReturnValue(mockSession);
      mockSessionRepository.save.mockResolvedValue(mockSession);

      const result = await service.create(mockCitizen, { topic: 'Labor rights' });
      expect(result).toEqual(mockSession);
    });
  });

  describe('findByUser', () => {
    it('should return sessions for citizen', async () => {
      mockSessionRepository.find.mockResolvedValue([mockSession]);
      const result = await service.findByUser(mockCitizen);
      expect(result).toEqual([mockSession]);
      expect(mockSessionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { citizen: { id: 'u1' } } }),
      );
    });

    it('should return sessions for expert (both sides)', async () => {
      mockSessionRepository.find.mockResolvedValue([mockSession]);
      const result = await service.findByUser(mockExpert);
      expect(result).toEqual([mockSession]);
      expect(mockSessionRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [{ citizen: { id: 'u2' } }, { expert: { id: 'u2' } }],
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a session', async () => {
      mockSessionRepository.findOne.mockResolvedValue(mockSession);
      const result = await service.findById('s1');
      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException', async () => {
      mockSessionRepository.findOne.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should allow citizen to cancel', async () => {
      const session = { ...mockSession, citizen: mockCitizen };
      mockSessionRepository.findOne.mockResolvedValue(session);
      mockSessionRepository.save.mockResolvedValue({
        ...session,
        status: ExpertSessionStatus.CANCELLED,
      });

      const result = await service.update('s1', mockCitizen, {
        status: ExpertSessionStatus.CANCELLED,
      });
      expect(result.status).toBe(ExpertSessionStatus.CANCELLED);
    });

    it('should allow expert to confirm', async () => {
      const session = { ...mockSession, citizen: mockCitizen, expert: mockExpert };
      mockSessionRepository.findOne.mockResolvedValue(session);
      mockSessionRepository.save.mockResolvedValue({
        ...session,
        status: ExpertSessionStatus.CONFIRMED,
      });

      const result = await service.update('s1', mockExpert, {
        status: ExpertSessionStatus.CONFIRMED,
      });
      expect(result.status).toBe(ExpertSessionStatus.CONFIRMED);
    });

    it('should throw ForbiddenException for unauthorized user', async () => {
      const session = { ...mockSession, citizen: mockCitizen, expert: mockExpert };
      mockSessionRepository.findOne.mockResolvedValue(session);

      await expect(
        service.update('s1', mockOther, { notes: 'hack' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if citizen tries to confirm', async () => {
      const session = { ...mockSession, citizen: mockCitizen };
      mockSessionRepository.findOne.mockResolvedValue(session);

      await expect(
        service.update('s1', mockCitizen, { status: ExpertSessionStatus.CONFIRMED }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('assignExpert', () => {
    it('should assign expert and confirm session', async () => {
      mockSessionRepository.findOne.mockResolvedValue(mockSession);
      mockSessionRepository.save.mockResolvedValue(mockSessionWithExpert);

      const result = await service.assignExpert('s1', mockExpert);
      expect(result.expert).toEqual(mockExpert);
      expect(result.status).toBe(ExpertSessionStatus.CONFIRMED);
    });
  });

  describe('getAvailableExperts', () => {
    it('should return verified experts', async () => {
      mockUserRepository.find.mockResolvedValue([mockExpert]);
      const result = await service.getAvailableExperts();
      expect(result).toEqual([mockExpert]);
      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: { role: UserRole.EXPERT, isVerifiedExpert: true },
      });
    });
  });
});
