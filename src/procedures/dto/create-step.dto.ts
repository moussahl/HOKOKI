import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateStepDto {
  @IsInt()
  @Min(1)
  stepOrder!: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredDocuments?: string[];

  @IsOptional()
  @IsString()
  locationHint?: string;
}
