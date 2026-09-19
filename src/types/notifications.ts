export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  pagination: NotificationPagination;
  unreadCount: number;
}

export interface AppNotification {
  id: string | number;
  title: string;
  body: string;
  is_read: boolean;
  type: string;
  created_at: string;
  data?: any;
}