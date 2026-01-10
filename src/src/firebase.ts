/**
 * Firebase Configuration
 * 
 * Initialize Firebase for push notifications
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
let app;
let messaging: Messaging | null = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Only initialize messaging if supported
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

/**
 * Request permission for push notifications
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Messaging not supported');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: (import.meta as any).env.VITE_FIREBASE_VAPID_KEY,
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      resolve(payload);
    });
  });

/**
 * Initialize push notifications
 */
export const initializePushNotifications = async () => {
  try {
    // Register service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registered:', registration);
    }

    // Request permission
    const token = await requestNotificationPermission();
    
    if (token) {
      // Store token in database
      // TODO: Send token to backend to store in user profile
      console.log('Push notification token obtained:', token);
    }

    return token;
  } catch (error) {
    console.error('Push notification initialization error:', error);
    return null;
  }
};

export { messaging };
export default app;
