/**
 * notificationService.ts — Client-side notification helpers
 *
 * No backend. Creates typed notification payloads for use
 * with AppContext's notify() function.
 */

import type { Notification } from '../context/AppContext';

export type NotificationType = Notification['type'];

/** Build a notification payload (pass to context `notify()`) */
export function createNotification(
    type: NotificationType,
    message: string,
    duration = 5000,
): Omit<Notification, 'id'> {
    return { type, message, duration };
}

export const notify = {
    success: (message: string, duration?: number) =>
        createNotification('success', message, duration),
    error: (message: string, duration?: number) =>
        createNotification('error', message, duration ?? 8000),
    warning: (message: string, duration?: number) =>
        createNotification('warning', message, duration),
    info: (message: string, duration?: number) =>
        createNotification('info', message, duration),
};
