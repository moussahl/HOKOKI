import { Law } from '../../database/entities/law.entity';

export class LawResponseDto {
  id!: string;
  slug!: string;
  title!: string;
  category!: string | null;
  language!: string;
  sourceUrl!: string;
  sourcePublishedAt!: Date | null;
  summary!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}

export function toLawResponseDto(law: Law): LawResponseDto {
  return {
    id: law.id,
    slug: law.slug,
    title: law.title,
    category: law.category,
    language: law.language,
    sourceUrl: law.sourceUrl,
    sourcePublishedAt: law.sourcePublishedAt,
    summary: law.summary,
    createdAt: law.createdAt,
    updatedAt: law.updatedAt,
  };
}
