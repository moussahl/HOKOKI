import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExpertSessionDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  topic?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
