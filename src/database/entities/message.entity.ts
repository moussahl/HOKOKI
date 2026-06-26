import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

export enum MessageSender {
  USER = 'user',
  ASSISTANT = 'assistant',
  EXPERT = 'expert',
  SYSTEM = 'system',
}

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation!: Conversation;

  @Column({
    type: 'enum',
    enum: MessageSender,
  })
  sender!: MessageSender;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'source_articles', type: 'jsonb', nullable: true })
  sourceArticles!: Record<string, unknown>[] | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
