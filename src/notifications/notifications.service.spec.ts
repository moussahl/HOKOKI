import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification, NotificationType } from '../database/entities/notification.entity';
import { NotificationsService } from './notifications.service';

const mockNotification = {
  id: 'n1',
  user: { id: 'u1' },
  type: NotificationType.LAW_UPDATE,
  title: 'New Law',
  body: 'A new law was published',
  payload: null,
  readAt: null,
  createdAt: new Date(),
};

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[mockNotification], 1]),
};

const mockRepository = {
  createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  findOne: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUser', () => {
    it('should return paginated notifications', async () => {
      const result = await service.findByUser('u1', 1, 20);
      expect(result.data).toEqual([mockNotification]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'notification.user_id = :userId',
        { userId: 'u1' },
      );
    });
  });

  describe('countUnread', () => {
    it('should return count of unread notifications', async () => {
      mockRepository.count.mockResolvedValue(3);
      const result = await service.countUnread('u1');
      expect(result).toBe(3);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const unread = { ...mockNotification, readAt: null };
      const read = { ...mockNotification, readAt: new Date() };
      mockRepository.findOne.mockResolvedValue(unread);
      mockRepository.save.mockResolvedValue(read);

      const result = await service.markAsRead('n1', 'u1');
      expect(result.readAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.markAsRead('nonexistent', 'u1')).rejects.toThrow(
        'Notification not found',
      );
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread to read', async () => {
      mockRepository.update.mockResolvedValue({ affected: 5 });
      await service.markAllAsRead('u1');
      expect(mockRepository.update).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create and return a notification', async () => {
      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.create(
        'u1',
        NotificationType.LAW_UPDATE,
        'New Law',
        'Body text',
      );
      expect(result).toEqual(mockNotification);
    });

    it('should create notification with payload', async () => {
      const payload = { key: 'value' };
      mockRepository.create.mockReturnValue({ ...mockNotification, payload });
      mockRepository.save.mockResolvedValue({ ...mockNotification, payload });

      const result = await service.create(
        'u1',
        NotificationType.PROCEDURE_REMINDER,
        'Reminder',
        'Body',
        payload,
      );
      expect(result.payload).toEqual(payload);
    });
  });
});
