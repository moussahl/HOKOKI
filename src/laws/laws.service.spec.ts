import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LawArticle } from '../database/entities/law-article.entity';
import { Law } from '../database/entities/law.entity';
import { LawsService } from './laws.service';

const mockLaw = { id: 'law-uuid-1', title: 'Code du travail', category: 'labor', language: 'ar', createdAt: new Date() };
const mockArticle = { id: 'art-uuid-1', title: 'Article 1', articleNumber: 1, originalText: 'text', simpleText: 'simple', law: mockLaw };

const buildQb = (result: any) => ({
  andWhere: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue(result),
});

const mockLawRepo = {
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  find: jest.fn(),
};

const mockArticleRepo = {
  createQueryBuilder: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

describe('LawsService', () => {
  let service: LawsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LawsService,
        { provide: getRepositoryToken(Law), useValue: mockLawRepo },
        { provide: getRepositoryToken(LawArticle), useValue: mockArticleRepo },
      ],
    }).compile();

    service = module.get<LawsService>(LawsService);
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns paginated laws', async () => {
      mockLawRepo.createQueryBuilder.mockReturnValue(buildQb([[mockLaw], 1]));

      const result = await service.list({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('defaults page to 1 and limit to 20 when undefined', async () => {
      mockLawRepo.createQueryBuilder.mockReturnValue(buildQb([[], 0]));

      const result = await service.list({});

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });
  });

  describe('getById', () => {
    it('returns the law when found', async () => {
      mockLawRepo.findOne.mockResolvedValue(mockLaw);

      const result = await service.getById('law-uuid-1');

      expect(result.id).toBe('law-uuid-1');
    });

    it('throws NotFoundException when law does not exist', async () => {
      mockLawRepo.findOne.mockResolvedValue(null);

      await expect(service.getById('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchArticles', () => {
    it('returns paginated article search results', async () => {
      mockArticleRepo.createQueryBuilder.mockReturnValue(buildQb([[mockArticle], 1]));

      const result = await service.searchArticles('text', 1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('deleteLaw', () => {
    it('throws NotFoundException when no rows affected', async () => {
      mockLawRepo.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteLaw('missing')).rejects.toThrow(NotFoundException);
    });

    it('resolves without error when law exists', async () => {
      mockLawRepo.delete.mockResolvedValue({ affected: 1 });

      await expect(service.deleteLaw('law-uuid-1')).resolves.toBeUndefined();
    });
  });
});
