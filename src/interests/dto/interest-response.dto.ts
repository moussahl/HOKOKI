import { UserInterest } from '../../database/entities/user-interest.entity';

export class InterestResponseDto {
  id!: string;
  userId!: string;
  topic!: string;
  isSubscribed!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export function toInterestResponseDto(interest: UserInterest): InterestResponseDto {
  return {
    id: interest.id,
    userId: interest.user?.id ?? '',
    topic: interest.topic,
    isSubscribed: interest.isSubscribed,
    createdAt: interest.createdAt,
    updatedAt: interest.updatedAt,
  };
}
