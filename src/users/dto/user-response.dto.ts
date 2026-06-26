import { User } from '../../database/entities/user.entity';

export class UserResponseDto {
  id!: string;
  email!: string;
  fullName!: string;
  role!: string;
  preferredLanguage!: string;
  isVerifiedExpert!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    isVerifiedExpert: user.isVerifiedExpert,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
