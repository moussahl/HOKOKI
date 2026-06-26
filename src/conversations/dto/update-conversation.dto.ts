import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ConversationStatus } from '../../database/entities/conversation.entity';

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;
}
