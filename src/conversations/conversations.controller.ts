import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '../database/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConversationsService } from './conversations.service';
import { ConversationResponseDto, toConversationResponseDto } from './dto/conversation-response.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto, toMessageResponseDto } from './dto/message-response.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationsService.create(user, dto);
    return toConversationResponseDto(conversation);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: ConversationResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const result = await this.conversationsService.findByUser(user.id, p, l);
    return {
      data: result.data.map((c) => toConversationResponseDto(c)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationsService.findById(id);
    return toConversationResponseDto(conversation);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationsService.update(id, dto);
    return toConversationResponseDto(conversation);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.conversationsService.delete(id);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  async addMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.conversationsService.addMessage(id, dto);
    return toMessageResponseDto(message);
  }

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: MessageResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 50));
    const result = await this.conversationsService.getMessages(id, p, l);
    return {
      data: result.data.map(toMessageResponseDto),
      meta: result.meta,
    };
  }
}
