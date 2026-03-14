import { get, put, del } from './http';

export interface Notification {
  id: string;
  userEmail: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  read: boolean;
  createdAt: string;
}

const BASE_URL = '/api/notifications';

export const getNotifications = () => get<Notification[]>(BASE_URL);

export const markAsRead = (id: string) => put(`${BASE_URL}/${id}/read`, {});

export const deleteNotification = (id: string) => del(`${BASE_URL}/${id}`);

export const clearAllNotifications = () => del(BASE_URL);

// WebSocket URL helper
export const getNotificationWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host; // Through Gateway
  return `${protocol}//${host}/ws/notifications`;
};
