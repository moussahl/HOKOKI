import { ProcedureStep } from '../../database/entities/procedure-step.entity';

export class StepResponseDto {
  id!: string;
  procedureId!: string;
  stepOrder!: number;
  title!: string;
  description!: string | null;
  requiredDocuments!: string[];
  locationHint!: string | null;
}

export function toStepResponseDto(step: ProcedureStep): StepResponseDto {
  return {
    id: step.id,
    procedureId: step.procedure?.id ?? '',
    stepOrder: step.stepOrder,
    title: step.title,
    description: step.description,
    requiredDocuments: step.requiredDocuments,
    locationHint: step.locationHint,
  };
}
