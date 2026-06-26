import { Message } from '../../database/entities/message.entity';

export class MessageResponseDto {
  id!: string;
  conversationId!: string;
  sender!: string;
  content!: string;
  sourceArticles!: Record<string, unknown>[] | null;
  createdAt!: Date;
}

export function toMessageResponseDto(message: Message): MessageResponseDto {
  return {
    id: message.id,
    conversationId: message.conversation.id,
    sender: message.sender,
    content: message.content,
    sourceArticles: message.sourceArticles,
    createdAt: message.createdAt,
  };
}
