import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../database/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ConversationsService } from './conversations.service';
import { ConversationResponseDto, toConversationResponseDto } from './dto/conversation-response.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageResponseDto, toMessageResponseDto } from './dto/message-response.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@ApiTags('conversations')
@ApiBearerAuth()
@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new conversation' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationsService.create(user, dto);
    return toConversationResponseDto(conversation);
  }

  @Get()
  @ApiOperation({ summary: 'List conversations for the current user' })
  async list(
    @CurrentUser() user: User,
    @Query() pagination: PaginationQueryDto,
  ): Promise<{
    data: ConversationResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const result = await this.conversationsService.findByUser(user.id, pagination.page ?? 1, pagination.limit ?? 20);
    return {
      data: result.data.map((c) => toConversationResponseDto(c)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationsService.findById(id);
    return toConversationResponseDto(conversation);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a conversation' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConversationDto,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.conversationsService.update(id, dto);
    return toConversationResponseDto(conversation);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a conversation' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.conversationsService.delete(id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add a message to a conversation' })
  async addMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.conversationsService.addMessage(id, dto);
    return toMessageResponseDto(message);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() pagination: PaginationQueryDto,
  ): Promise<{
    data: MessageResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const result = await this.conversationsService.getMessages(id, pagination.page ?? 1, pagination.limit ?? 50);
    return {
      data: result.data.map(toMessageResponseDto),
      meta: result.meta,
    };
  }
}
