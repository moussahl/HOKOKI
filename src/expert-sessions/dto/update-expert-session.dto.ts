import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ExpertSessionStatus } from '../../database/entities/expert-session.entity';

export class UpdateExpertSessionDto {
  @IsOptional()
  @IsEnum(ExpertSessionStatus)
  status?: ExpertSessionStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
