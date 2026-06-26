import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../database/entities/user.entity';

export class UserResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() fullName!: string;
  @ApiProperty() role!: string;
  @ApiProperty() preferredLanguage!: string;
  @ApiProperty() isVerifiedExpert!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
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
