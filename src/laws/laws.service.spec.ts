import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Law } from '../database/entities/law.entity';
import { LawArticle } from '../database/entities/law-article.entity';
import { LawsService } from './laws.service';

const mockLaw = {
  id: 'l1',
  slug: 'code-du-travail',
  title: 'قانون العمل',
  category: 'labor',
  language: 'ar',
  sourceUrl: 'https://example.com',
  sourcePublishedAt: null,
  summary: 'Summary text',
  articles: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockArticle = {
  id: 'a1',
  law: mockLaw,
  articleNumber: '1',
  title: 'Article 1',
  originalText: 'Original text',
  simpleText: 'Simple text',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockLaw], 1]),
};

const mockLawRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockArticleRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    ...mockQueryBuilder,
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockArticle], 1]),
  }),
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('LawsService', () => {
  let service: LawsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LawsService,
        { provide: getRepositoryToken(Law), useValue: mockLawRepository },
        { provide: getRepositoryToken(LawArticle), useValue: mockArticleRepository },
      ],
    }).compile();

    service = module.get<LawsService>(LawsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('list', () => {
    it('should return paginated laws without filters', async () => {
      const result = await service.list({});
      expect(result.data).toEqual([mockLaw]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should apply category filter', async () => {
      await service.list({ category: 'labor' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'law.category = :category',
        { category: 'labor' },
      );
    });

    it('should apply search filter', async () => {
      await service.list({ search: 'work' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(law.title ILIKE :search OR law.summary ILIKE :search)',
        { search: '%work%' },
      );
    });
  });

  describe('getById', () => {
    it('should return a law', async () => {
      mockLawRepository.findOne.mockResolvedValue(mockLaw);
      const result = await service.getById('l1');
      expect(result).toEqual(mockLaw);
    });

    it('should throw NotFoundException', async () => {
      mockLawRepository.findOne.mockResolvedValue(null);
      await expect(service.getById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchArticles', () => {
    it('should return paginated articles', async () => {
      const result = await service.searchArticles('test', 1, 20);
      expect(result.data).toEqual([mockArticle]);
    });
  });

  describe('getArticleById', () => {
    it('should return an article', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      const result = await service.getArticleById('a1');
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);
      await expect(service.getArticleById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createLaw', () => {
    it('should create a law', async () => {
      mockLawRepository.create.mockReturnValue(mockLaw);
      mockLawRepository.save.mockResolvedValue(mockLaw);
      const result = await service.createLaw({ title: 'New Law' } as Partial<Law>);
      expect(result).toEqual(mockLaw);
    });
  });

  describe('updateLaw', () => {
    it('should update a law', async () => {
      const updated = { ...mockLaw, title: 'Updated' };
      mockLawRepository.findOne.mockResolvedValue(mockLaw);
      mockLawRepository.save.mockResolvedValue(updated);
      const result = await service.updateLaw('l1', { title: 'Updated' } as Partial<Law>);
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteLaw', () => {
    it('should delete a law', async () => {
      mockLawRepository.delete.mockResolvedValue({ affected: 1 });
      await service.deleteLaw('l1');
    });

    it('should throw NotFoundException', async () => {
      mockLawRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.deleteLaw('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getArticlesByLawId', () => {
    it('should return articles for a law', async () => {
      mockLawRepository.findOne.mockResolvedValue(mockLaw);
      mockArticleRepository.find.mockResolvedValue([mockArticle]);
      const result = await service.getArticlesByLawId('l1');
      expect(result).toEqual([mockArticle]);
    });

    it('should throw NotFoundException if law not found', async () => {
      mockLawRepository.findOne.mockResolvedValue(null);
      await expect(service.getArticlesByLawId('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
