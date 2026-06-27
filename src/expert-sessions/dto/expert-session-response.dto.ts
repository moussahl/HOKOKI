import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpertSession } from '../../database/entities/expert-session.entity';

export class ExpertSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() fullName!: string;
  @ApiPropertyOptional() specialty!: string | null;
  @ApiProperty() averageRating!: number;
  @ApiProperty() ratingCount!: number;
}

export class ExpertSessionResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() citizenId!: string;
  @ApiPropertyOptional({ type: ExpertSummaryDto }) expert!: ExpertSummaryDto | null;
  @ApiPropertyOptional() topic!: string | null;
  @ApiPropertyOptional() notes!: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional() citizenRating!: number | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export function toExpertSessionResponseDto(session: ExpertSession): ExpertSessionResponseDto {
  return {
    id: session.id,
    citizenId: session.citizen?.id ?? '',
    expert: session.expert
      ? {
          id: session.expert.id,
          fullName: session.expert.fullName,
          specialty: session.expert.specialty,
          averageRating: session.expert.averageRating,
          ratingCount: session.expert.ratingCount,
        }
      : null,
    topic: session.topic,
    notes: session.notes,
    status: session.status,
    citizenRating: session.citizenRating,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}
