import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ProcedureProgressStatus } from '../../database/entities/procedure-progress.entity';

export class UpdateProgressDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  currentStepOrder?: number;

  @IsOptional()
  @IsEnum(ProcedureProgressStatus)
  status?: ProcedureProgressStatus;

  @IsOptional()
  @IsString()
  adviceNote?: string;
}
