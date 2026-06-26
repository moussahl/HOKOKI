import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Notification, NotificationType } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findByUser(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Notification[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { user: { id: userId }, readAt: IsNull() },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!notification) throw new NotFoundException('Notification not found');
    notification.readAt = new Date();
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { user: { id: userId }, readAt: IsNull() },
      { readAt: new Date() },
    );
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    payload?: Record<string, unknown>,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      user: { id: userId } as User,
      type,
      title,
      body,
      payload: payload ?? null,
    });
    return this.notificationRepository.save(notification);
  }
}
