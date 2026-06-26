import { Conversation } from '../../database/entities/conversation.entity';

export class ConversationResponseDto {
  id!: string;
  userId!: string | null;
  title!: string | null;
  status!: string;
  messageCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

export function toConversationResponseDto(
  conversation: Conversation,
  messageCount?: number,
): ConversationResponseDto {
  return {
    id: conversation.id,
    userId: conversation.user?.id ?? null,
    title: conversation.title,
    status: conversation.status,
    messageCount: messageCount ?? conversation.messages?.length ?? 0,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}
