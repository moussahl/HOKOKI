import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Procedure } from '../database/entities/procedure.entity';
import { ProcedureProgress, ProcedureProgressStatus } from '../database/entities/procedure-progress.entity';
import { ProcedureStep } from '../database/entities/procedure-step.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { ProceduresService } from './procedures.service';

const mockUser = { id: 'u1', role: UserRole.CITIZEN } as User;
const mockProcedure = {
  id: 'p1',
  key: 'test-proc',
  title: 'Test Procedure',
  description: 'Description',
  steps: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockStep = {
  id: 's1',
  procedure: mockProcedure,
  stepOrder: 1,
  title: 'Step 1',
  description: 'Do step 1',
  requiredDocuments: [],
  locationHint: null,
};
const mockProgress = {
  id: 'pr1',
  user: mockUser,
  procedure: mockProcedure,
  currentStepOrder: 1,
  status: ProcedureProgressStatus.IN_PROGRESS,
  adviceNote: null,
  startedAt: new Date(),
  completedAt: null,
  updatedAt: new Date(),
};

const mockProcedureRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockStepRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockProgressRepository = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('ProceduresService', () => {
  let service: ProceduresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProceduresService,
        { provide: getRepositoryToken(Procedure), useValue: mockProcedureRepository },
        { provide: getRepositoryToken(ProcedureStep), useValue: mockStepRepository },
        { provide: getRepositoryToken(ProcedureProgress), useValue: mockProgressRepository },
      ],
    }).compile();

    service = module.get<ProceduresService>(ProceduresService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return all procedures', async () => {
      mockProcedureRepository.find.mockResolvedValue([mockProcedure]);
      const result = await service.list();
      expect(result).toEqual([mockProcedure]);
    });
  });

  describe('findByKey', () => {
    it('should return a procedure', async () => {
      mockProcedureRepository.findOne.mockResolvedValue(mockProcedure);
      const result = await service.findByKey('test-proc');
      expect(result).toEqual(mockProcedure);
    });

    it('should throw NotFoundException', async () => {
      mockProcedureRepository.findOne.mockResolvedValue(null);
      await expect(service.findByKey('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a procedure', async () => {
      mockProcedureRepository.findOne.mockResolvedValue(mockProcedure);
      const result = await service.findById('p1');
      expect(result).toEqual(mockProcedure);
    });
  });

  describe('create', () => {
    it('should create a procedure', async () => {
      mockProcedureRepository.findOne.mockResolvedValue(null);
      mockProcedureRepository.create.mockReturnValue(mockProcedure);
      mockProcedureRepository.save.mockResolvedValue(mockProcedure);

      const result = await service.create({
        key: 'test-proc',
        title: 'Test',
        description: 'Desc',
      });
      expect(result).toEqual(mockProcedure);
    });

    it('should throw ConflictException if key exists', async () => {
      mockProcedureRepository.findOne.mockResolvedValue(mockProcedure);
      await expect(
        service.create({ key: 'test-proc', title: 'Test', description: 'Desc' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update a procedure', async () => {
      const updated = { ...mockProcedure, title: 'Updated' };
      mockProcedureRepository.findOne.mockResolvedValue(mockProcedure);
      mockProcedureRepository.save.mockResolvedValue(updated);
      const result = await service.update('p1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete a procedure', async () => {
      mockProcedureRepository.delete.mockResolvedValue({ affected: 1 });
      await service.delete('p1');
    });

    it('should throw NotFoundException', async () => {
      mockProcedureRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addStep', () => {
    it('should add a step to procedure', async () => {
      mockProcedureRepository.findOne.mockResolvedValue(mockProcedure);
      mockStepRepository.create.mockReturnValue(mockStep);
      mockStepRepository.save.mockResolvedValue(mockStep);

      const result = await service.addStep('p1', {
        stepOrder: 1,
        title: 'Step 1',
      });
      expect(result).toEqual(mockStep);
    });
  });

  describe('updateStep', () => {
    it('should update a step', async () => {
      const updated = { ...mockStep, title: 'Updated Step' };
      mockStepRepository.findOne.mockResolvedValue(mockStep);
      mockStepRepository.save.mockResolvedValue(updated);
      const result = await service.updateStep('s1', { title: 'Updated Step' });
      expect(result.title).toBe('Updated Step');
    });

    it('should throw NotFoundException', async () => {
      mockStepRepository.findOne.mockResolvedValue(null);
      await expect(service.updateStep('nonexistent', { title: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteStep', () => {
    it('should delete a step', async () => {
      mockStepRepository.delete.mockResolvedValue({ affected: 1 });
      await service.deleteStep('s1');
    });

    it('should throw NotFoundException', async () => {
      mockStepRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.deleteStep('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('startProcedure', () => {
    it('should start a procedure for user', async () => {
      mockProcedureRepository.findOne.mockResolvedValue(mockProcedure);
      mockProgressRepository.findOne.mockResolvedValue(null);
      mockProgressRepository.create.mockReturnValue(mockProgress);
      mockProgressRepository.save.mockResolvedValue(mockProgress);

      const result = await service.startProcedure(mockUser, 'p1');
      expect(result).toEqual(mockProgress);
    });

    it('should throw ConflictException if already started', async () => {
      mockProcedureRepository.findOne.mockResolvedValue(mockProcedure);
      mockProgressRepository.findOne.mockResolvedValue(mockProgress);
      await expect(service.startProcedure(mockUser, 'p1')).rejects.toThrow(ConflictException);
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress', async () => {
      mockProgressRepository.find.mockResolvedValue([mockProgress]);
      const result = await service.getUserProgress('u1');
      expect(result).toEqual([mockProgress]);
    });
  });

  describe('updateProgress', () => {
    it('should update progress', async () => {
      const updated = { ...mockProgress, currentStepOrder: 2 };
      mockProgressRepository.findOne.mockResolvedValue(mockProgress);
      mockProgressRepository.save.mockResolvedValue(updated);

      const result = await service.updateProgress('pr1', 'u1', {
        currentStepOrder: 2,
      });
      expect(result.currentStepOrder).toBe(2);
    });

    it('should set completedAt when status is COMPLETED', async () => {
      const updated = { ...mockProgress, status: ProcedureProgressStatus.COMPLETED, completedAt: new Date() };
      mockProgressRepository.findOne.mockResolvedValue(mockProgress);
      mockProgressRepository.save.mockResolvedValue(updated);

      const result = await service.updateProgress('pr1', 'u1', {
        status: ProcedureProgressStatus.COMPLETED,
      });
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException', async () => {
      mockProgressRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateProgress('nonexistent', 'u1', { currentStepOrder: 2 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
