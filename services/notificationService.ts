import { get, put, del } from './http';

export interface Notification {
  id: string;
  userEmail: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const BASE_URL = '/api/notifications';

export const getNotifications = () => get<Notification[]>(BASE_URL, true);

export const getUnreadCount = () => get<{ count: number }>(`${BASE_URL}/unread-count`, true);

export const markAsRead = (id: string) => put(`${BASE_URL}/${id}/read`, {}, true);

export const markAllAsRead = () => put(`${BASE_URL}/read-all`, {}, true);

export const deleteNotification = (id: string) => del(`${BASE_URL}/${id}`, true);

export const clearAllNotifications = () => del(BASE_URL, true);

// WebSocket URL helper
export const getNotificationWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host; // Through Gateway
  return `${protocol}//${host}/ws/notifications`;
};
