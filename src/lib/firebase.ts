import { initializeApp } from 'firebase/app';
import { getMessaging, onMessage, getToken } from 'firebase/messaging';
import type { AxiosInstance } from 'axios';

/**
 * Firebase Configuration and Initialization
 * Handles app initialization and push notification setup
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Get messaging instance
export const messaging = getMessaging(firebaseApp);

/**
 * Request permission and get FCM token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

/**
 * Listen for incoming messages
 */
export interface FirebaseMessagePayload {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: Record<string, unknown>;
}

export const setupMessageListener = (callback: (payload: FirebaseMessagePayload) => void) => {
  onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    callback(payload as FirebaseMessagePayload);
  });
};

export const saveFCMTokenToBackend = async (token: string, apiClient: AxiosInstance) => {
  try {
    await apiClient.post('/notifications/fcm-token', { fcmToken: token });
  } catch (error) {
    console.error('Failed to save FCM token:', error);
  }
};
