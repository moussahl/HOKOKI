import { ExpertSession } from '../../database/entities/expert-session.entity';

export class ExpertSessionResponseDto {
  id!: string;
  citizenId!: string;
  expertId!: string | null;
  topic!: string | null;
  notes!: string | null;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export function toExpertSessionResponseDto(
  session: ExpertSession,
): ExpertSessionResponseDto {
  return {
    id: session.id,
    citizenId: session.citizen?.id ?? '',
    expertId: session.expert?.id ?? null,
    topic: session.topic,
    notes: session.notes,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}
