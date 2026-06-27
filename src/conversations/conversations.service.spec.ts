import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Conversation, ConversationStatus } from '../database/entities/conversation.entity';
import { Message, MessageSender } from '../database/entities/message.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { ConversationsService } from './conversations.service';

const mockUser = { id: 'u1', role: UserRole.CITIZEN } as User;
const mockConversation = {
  id: 'c1',
  user: mockUser,
  title: 'Test Chat',
  status: ConversationStatus.OPEN,
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};
const mockMessage = {
  id: 'm1',
  conversation: mockConversation,
  sender: MessageSender.USER,
  content: 'Hello',
  sourceArticles: null,
  createdAt: new Date(),
};

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockConversation], 1]),
};

const mockConversationRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
};

const mockMessageRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    ...mockQueryBuilder,
    getManyAndCount: jest.fn().mockResolvedValue([[mockMessage], 1]),
  }),
  create: jest.fn(),
  save: jest.fn(),
};

describe('ConversationsService', () => {
  let service: ConversationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        { provide: getRepositoryToken(Conversation), useValue: mockConversationRepository },
        { provide: getRepositoryToken(Message), useValue: mockMessageRepository },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a conversation', async () => {
      mockConversationRepository.create.mockReturnValue(mockConversation);
      mockConversationRepository.save.mockResolvedValue(mockConversation);

      const result = await service.create(mockUser, { title: 'Test Chat' });
      expect(result).toEqual(mockConversation);
    });
  });

  describe('findByUser', () => {
    it('should return paginated conversations', async () => {
      const result = await service.findByUser('u1', 1, 20);
      expect(result.data).toEqual([mockConversation]);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a conversation', async () => {
      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      const result = await service.findById('c1');
      expect(result).toEqual(mockConversation);
    });

    it('should throw NotFoundException if not found', async () => {
      mockConversationRepository.findOne.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update conversation title and status', async () => {
      const updated = { ...mockConversation, title: 'Updated', status: ConversationStatus.CLOSED };
      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockConversationRepository.save.mockResolvedValue(updated);

      const result = await service.update('c1', {
        title: 'Updated',
        status: ConversationStatus.CLOSED,
      });
      expect(result.title).toBe('Updated');
      expect(result.status).toBe(ConversationStatus.CLOSED);
    });
  });

  describe('delete', () => {
    it('should delete a conversation', async () => {
      mockConversationRepository.delete.mockResolvedValue({ affected: 1 });
      await service.delete('c1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockConversationRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMessage', () => {
    it('should add a message to conversation', async () => {
      mockConversationRepository.findOne.mockResolvedValue(mockConversation);
      mockMessageRepository.create.mockReturnValue(mockMessage);
      mockMessageRepository.save.mockResolvedValue(mockMessage);

      const result = await service.addMessage('c1', {
        sender: MessageSender.USER,
        content: 'Hello',
      });
      expect(result).toEqual(mockMessage);
    });
  });

  describe('getMessages', () => {
    it('should return paginated messages', async () => {
      const result = await service.getMessages('c1', 1, 50);
      expect(result.data).toEqual([mockMessage]);
      expect(result.meta.total).toBe(1);
    });
  });
});
