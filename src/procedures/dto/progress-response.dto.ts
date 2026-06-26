import { ProcedureProgress } from '../../database/entities/procedure-progress.entity';

export class ProgressResponseDto {
  id!: string;
  userId!: string;
  procedureId!: string;
  procedureKey!: string;
  procedureTitle!: string;
  currentStepOrder!: number;
  status!: string;
  adviceNote!: string | null;
  startedAt!: Date | null;
  completedAt!: Date | null;
  updatedAt!: Date;
}

export function toProgressResponseDto(
  progress: ProcedureProgress,
): ProgressResponseDto {
  return {
    id: progress.id,
    userId: progress.user?.id ?? '',
    procedureId: progress.procedure?.id ?? '',
    procedureKey: progress.procedure?.key ?? '',
    procedureTitle: progress.procedure?.title ?? '',
    currentStepOrder: progress.currentStepOrder,
    status: progress.status,
    adviceNote: progress.adviceNote,
    startedAt: progress.startedAt,
    completedAt: progress.completedAt,
    updatedAt: progress.updatedAt,
  };
}
