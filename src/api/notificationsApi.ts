import api from './axios';
import type {NotificationsResponse} from "../types/notifications"

export const notificationsAPI = {
  // 1. جلب قائمة الإشعارات الخاصة بالمستخدم
  getNotifications: async (page: number = 1, limit: number = 20): Promise<NotificationsResponse> => {
    const response = await api.get<NotificationsResponse>('notifications', {
      params: { page, limit }
    });
    return response.data;
  },

  // 2. تحديد كل الإشعارات كمقروءة
  markAllAsRead: async (): Promise<any> => {
    const response = await api.patch<any>('notifications/read');
    return response.data;
  }
};