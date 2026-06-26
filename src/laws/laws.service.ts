import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LawArticle } from '../database/entities/law-article.entity';
import { Law } from '../database/entities/law.entity';
import { ListLawsQueryDto } from './dto/list-laws-query.dto';

@Injectable()
export class LawsService {
  constructor(
    @InjectRepository(Law)
    private readonly lawRepository: Repository<Law>,
    @InjectRepository(LawArticle)
    private readonly lawArticleRepository: Repository<LawArticle>,
  ) {}

  async list(query: ListLawsQueryDto): Promise<{
    data: Law[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.lawRepository.createQueryBuilder('law');

    if (query.category) {
      qb.andWhere('law.category = :category', { category: query.category });
    }

    if (query.language) {
      qb.andWhere('law.language = :language', { language: query.language });
    }

    if (query.search) {
      qb.andWhere('(law.title ILIKE :search OR law.summary ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('law.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getById(id: string): Promise<Law> {
    const law = await this.lawRepository.findOne({ where: { id } });

    if (!law) {
      throw new NotFoundException(`Law with id ${id} was not found`);
    }

    return law;
  }

  async searchArticles(
    query: string,
    page: number,
    limit: number,
  ): Promise<{ data: LawArticle[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const qb = this.lawArticleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.law', 'law')
      .where('article.originalText ILIKE :q', { q: `%${query}%` })
      .orWhere('article.title ILIKE :q', { q: `%${query}%` })
      .orWhere('article.simpleText ILIKE :q', { q: `%${query}%` })
      .orderBy('article.articleNumber', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async getArticleById(id: string): Promise<LawArticle> {
    const article = await this.lawArticleRepository.findOne({
      where: { id },
      relations: ['law'],
    });
    if (!article) throw new NotFoundException(`Article with id ${id} was not found`);
    return article;
  }

  async createLaw(dto: Partial<Law>): Promise<Law> {
    const law = this.lawRepository.create(dto);
    return this.lawRepository.save(law);
  }

  async updateLaw(id: string, dto: Partial<Law>): Promise<Law> {
    const law = await this.getById(id);
    Object.assign(law, dto);
    return this.lawRepository.save(law);
  }

  async deleteLaw(id: string): Promise<void> {
    const result = await this.lawRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Law with id ${id} was not found`);
  }

  async getArticlesByLawId(lawId: string): Promise<LawArticle[]> {
    const law = await this.lawRepository.findOne({ where: { id: lawId } });

    if (!law) {
      throw new NotFoundException(`Law with id ${lawId} was not found`);
    }

    return this.lawArticleRepository.find({
      where: { law: { id: lawId } },
      relations: ['law'],
      order: { articleNumber: 'ASC' },
    });
  }
}
