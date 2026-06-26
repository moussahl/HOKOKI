import { LawArticle } from '../../database/entities/law-article.entity';

export class LawArticleResponseDto {
  id!: string;
  lawId!: string;
  articleNumber!: string;
  title!: string | null;
  originalText!: string;
  simpleText!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export function toLawArticleResponseDto(
  article: LawArticle,
): LawArticleResponseDto {
  return {
    id: article.id,
    lawId: article.law.id,
    articleNumber: article.articleNumber,
    title: article.title,
    originalText: article.originalText,
    simpleText: article.simpleText,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
  };
}
