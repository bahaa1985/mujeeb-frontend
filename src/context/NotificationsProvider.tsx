import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../api/notificationsApi';
import type{ AppNotification, NotificationPagination } from '../types/notifications';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  notifications: AppNotification[];
  pagination: NotificationPagination | null;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: (page?: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [pagination, setPagination] = useState<NotificationPagination | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async (page: number = 1) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await notificationsAPI.getNotifications(page);
      setNotifications(response.notifications);
      setPagination(response.pagination);
      setUnreadCount(response.unreadCount);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationsAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err: any) {
      console.error('Failed to mark notifications as read', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Optionally set up polling or websocket listener here
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setPagination(null);
    }
  }, [user, fetchNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        pagination,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
