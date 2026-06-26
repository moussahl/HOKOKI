import { Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { User } from '../database/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { NotificationResponseDto, toNotificationResponseDto } from './dto/notification-response.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    data: NotificationResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 20));
    const result = await this.notificationsService.findByUser(user.id, p, l);
    return {
      data: result.data.map(toNotificationResponseDto),
      meta: result.meta,
    };
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: User): Promise<{ count: number }> {
    const count = await this.notificationsService.countUnread(user.id);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationsService.markAsRead(id, user.id);
    return toNotificationResponseDto(notification);
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: User): Promise<void> {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
