import { useEffect, useState } from 'react';
import { getFCMToken, setupMessageListener, saveFCMTokenToBackend } from '../lib/firebase';
import apiClient from '../lib/api-client';

/**
 * Hook for managing Firebase Push Notifications
 * Handles permission requests, token management, and message listening
 */

export interface PushNotification {
  title: string;
  body: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'Notification' in window;
    setIsSupported(supported);
  }, []);

  // Initialize push notifications
  useEffect(() => {
    if (!isSupported) return;

    const initializePushNotifications = async () => {
      try {
        // Register service worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register(
            '/firebase-messaging-sw.js'
          );
          console.log('Service Worker registered:', registration);
        }

        // Get FCM token
        const token = await getFCMToken();
        if (token) {
          console.log('FCM Token:', token);
          setIsSubscribed(true);
          
          // Save token to backend
          await saveFCMTokenToBackend(token, apiClient);

          // Setup message listener
          setupMessageListener((payload) => {
            const notification: PushNotification = {
              title: payload.notification?.title || 'Notification',
              body: payload.notification?.body || '',
              timestamp: Date.now(),
              data: payload.data,
            };

            setNotifications((prev) => [notification, ...prev].slice(0, 10)); // Keep last 10

            // Show browser notification if app is in background
            if (Notification.permission === 'granted') {
              new Notification(notification.title, {
                body: notification.body,
                icon: '/aiko-icon.png',
              });
            }
          });
        }
      } catch (err) {
        console.error('Failed to initialize push notifications:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initializePushNotifications();
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    notifications,
    error,
  };
};
