import { Procedure } from '../../database/entities/procedure.entity';
import { StepResponseDto, toStepResponseDto } from './step-response.dto';

export class ProcedureResponseDto {
  id!: string;
  key!: string;
  title!: string;
  description!: string;
  steps!: StepResponseDto[];
  createdAt!: Date;
  updatedAt!: Date;
}

export function toProcedureResponseDto(
  procedure: Procedure,
): ProcedureResponseDto {
  return {
    id: procedure.id,
    key: procedure.key,
    title: procedure.title,
    description: procedure.description,
    steps: procedure.steps?.map(toStepResponseDto) ?? [],
    createdAt: procedure.createdAt,
    updatedAt: procedure.updatedAt,
  };
}
