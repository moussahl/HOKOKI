import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, ConversationStatus } from '../database/entities/conversation.entity';
import { Message, MessageSender } from '../database/entities/message.entity';
import { User } from '../database/entities/user.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(user: User | null, dto: CreateConversationDto): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      user,
      title: dto.title ?? null,
      status: ConversationStatus.OPEN,
    });
    return this.conversationRepository.save(conversation);
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Conversation[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const qb = this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .where('conversation.user_id = :userId', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async findById(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['messages', 'user'],
    });
    if (!conversation) {
      throw new NotFoundException(`Conversation with id ${id} was not found`);
    }
    return conversation;
  }

  async update(id: string, dto: UpdateConversationDto): Promise<Conversation> {
    const conversation = await this.findById(id);
    if (dto.title !== undefined) conversation.title = dto.title;
    if (dto.status !== undefined) conversation.status = dto.status;
    return this.conversationRepository.save(conversation);
  }

  async delete(id: string): Promise<void> {
    const result = await this.conversationRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Conversation with id ${id} was not found`);
    }
  }

  async addMessage(
    conversationId: string,
    dto: CreateMessageDto,
  ): Promise<Message> {
    const conversation = await this.findById(conversationId);
    const message = this.messageRepository.create({
      conversation,
      sender: dto.sender as MessageSender,
      content: dto.content,
      sourceArticles: dto.sourceArticles ? [dto.sourceArticles] : null,
    });
    return this.messageRepository.save(message);
  }

  async getMessages(
    conversationId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Message[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const qb = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.conversation', 'conversation')
      .where('conversation.id = :conversationId', { conversationId })
      .orderBy('message.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }
}
