import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useNotifications } from '../context/NotificationsProvider';
import { useLanguage } from '../context/LanguageContext';
import type{ AppNotification } from '../types/notifications';

const NotificationsPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [hiddenNotificationIds, setHiddenNotificationIds] = useState<Set<string>>(new Set());
  const [visibleSystemErrorIds, setVisibleSystemErrorIds] = useState<Set<string>>(new Set());
  const {
    notifications,
    pagination,
    loading,
    error,
    fetchNotifications,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleNotificationClick = (notification: AppNotification) => {
    if (notification.type === 'ORDER_REQUEST') {
      const contactNumber = notification.data?.fromNumber || notification.data?.from_number;
      if (contactNumber) {
        navigate(`/messages?contact=${contactNumber}`);
      } else {
        navigate('/messages');
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchNotifications(newPage);
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            {t('layout.notifications')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            {t('notifications.subtitle') || 'Manage your alerts and updates'}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl  overflow-hidden">
          {loading && notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('common.loading')}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('notifications.empty') || 'No notifications yet'}
            </div>
          ) : (
            <ul className="space-y-3">
              {notifications.map((notification) => {
                const notificationId = String(notification.id);
                const isSystemError = notification.type === 'SYSTEM_ERROR';
                const isHidden = isSystemError
                  ? !visibleSystemErrorIds.has(notificationId)
                  : hiddenNotificationIds.has(notificationId);

                return (
                  <li
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-md border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      {notification.title} {[notification.type === 'SYSTEM_ERROR' && notification.data?.error_title]}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(notification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    {!isHidden && (
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        {notification.body}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (isSystemError) {
                          setVisibleSystemErrorIds((current) => {
                            const next = new Set(current);
                            if (next.has(notificationId)) {
                              next.delete(notificationId);
                            } else {
                              next.add(notificationId);
                            }
                            return next;
                          });
                        } else {
                          setHiddenNotificationIds((current) => {
                            const next = new Set(current);
                            if (next.has(notificationId)) {
                              next.delete(notificationId);
                            } else {
                              next.add(notificationId);
                            }
                            return next;
                          });
                        }
                      }}
                      className="shrink-0 text-xs text-primary hover:underline"
                    >
                      {isHidden
                        ? t('layout.view')
                        : t('layout.hide')}
                    </button>
                  </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`px-3 py-1 rounded-md text-sm ${
                  pagination.page === p
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default NotificationsPage;
