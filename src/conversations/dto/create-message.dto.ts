import { IsEnum, IsObject, IsOptional, IsString, MinLength } from 'class-validator';
import { MessageSender } from '../../database/entities/message.entity';

export class CreateMessageDto {
  @IsEnum(MessageSender)
  sender!: MessageSender;

  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsObject()
  sourceArticles?: Record<string, unknown>;
}
