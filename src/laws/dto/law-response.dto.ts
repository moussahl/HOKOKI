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
