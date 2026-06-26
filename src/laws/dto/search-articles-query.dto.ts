import { IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class SearchArticlesQueryDto extends PaginationQueryDto {
  @IsString()
  q!: string;
}
