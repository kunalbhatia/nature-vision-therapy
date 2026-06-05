import { useCallback } from 'react';
import { useSnackbar } from './Snackbar';

export const useNotifications = () => {
  const { showMessage } = useSnackbar();

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      showMessage('This browser does not support notifications.', 'error');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showMessage('Notifications enabled!', 'success');
        return true;
      }
    }

    return false;
  }, [showMessage]);

  const sendNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/vite.svg', // Default icon
        ...options
      });
    }
  }, []);

  const scheduleReminder = useCallback((minutes: number, message: string) => {
    setTimeout(() => {
      sendNotification('Vision Therapy Reminder', {
        body: message,
        tag: 'therapy-reminder'
      });
    }, minutes * 60000);
  }, [sendNotification]);

  return {
    requestPermission,
    sendNotification,
    scheduleReminder,
    permissionStatus: typeof Notification !== 'undefined' ? Notification.permission : 'not-supported'
  };
};
