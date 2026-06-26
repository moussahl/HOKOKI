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
    const page = Number.isFinite(Number(query.page))
      ? Math.max(1, Number(query.page))
      : 1;
    const limit = Number.isFinite(Number(query.limit))
      ? Math.min(100, Math.max(1, Number(query.limit)))
      : 20;

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

  async getArticlesByLawId(lawId: string): Promise<LawArticle[]> {
    const law = await this.lawRepository.findOne({ where: { id: lawId } });

    if (!law) {
      throw new NotFoundException(`Law with id ${lawId} was not found`);
    }

    return this.lawArticleRepository.find({
      where: { law: { id: lawId } },
      order: { articleNumber: 'ASC' },
    });
  }
}
