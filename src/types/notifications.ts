export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

export interface NotificationsResponse {
  data: AppNotification[];
  meta: NotificationPagination;
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