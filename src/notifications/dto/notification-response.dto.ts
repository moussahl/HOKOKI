import { Notification } from '../../database/entities/notification.entity';

export class NotificationResponseDto {
  id!: string;
  userId!: string;
  type!: string;
  title!: string;
  body!: string;
  payload!: Record<string, unknown> | null;
  readAt!: Date | null;
  createdAt!: Date;
}

export function toNotificationResponseDto(
  notification: Notification,
): NotificationResponseDto {
  return {
    id: notification.id,
    userId: notification.user?.id ?? '',
    type: notification.type,
    title: notification.title,
    body: notification.body,
    payload: notification.payload,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
  };
}
