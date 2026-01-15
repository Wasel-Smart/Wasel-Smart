/**
 * Firebase Configuration for Wassel
 * 
 * This file initializes Firebase services for push notifications,
 * analytics, and real-time features.
 * 
 * Setup Instructions:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Add a web app to your project
 * 3. Copy the config values to your .env file:
 *    - VITE_FIREBASE_API_KEY
 *    - VITE_FIREBASE_PROJECT_ID
 *    - VITE_FIREBASE_MESSAGING_SENDER_ID
 *    - VITE_FIREBASE_APP_ID
 * 4. Enable Cloud Messaging in Firebase Console
 * 5. Generate a VAPID key for web push notifications
 */

import { initializeApp, FirebaseApp, FirebaseOptions } from 'firebase/app';
import { getMessaging, Messaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics, Analytics, logEvent } from 'firebase/analytics';
import { getPerformance, Performance } from 'firebase/performance';

// Firebase configuration from environment variables
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validation helper
function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
  );
}

// Initialize Firebase app
let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;
let performance: Performance | null = null;

try {
  if (isFirebaseConfigured()) {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');

    // Initialize messaging for push notifications only when supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      try {
        messaging = getMessaging(app);
        console.log('✅ Firebase Messaging initialized');
      } catch (err) {
        console.warn('Firebase Messaging initialization failed:', err);
        messaging = null;
      }
    }

    // Use Vite's MODE to detect production reliably
    const isProd = import.meta.env.MODE === 'production' || import.meta.env.VITE_APP_ENV === 'production';

    // Initialize analytics (only in production and when window exists)
    if (isProd && typeof window !== 'undefined') {
      try {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
      } catch (err) {
        console.warn('Firebase Analytics init failed:', err);
      }
    }

    // Initialize performance monitoring (only in production and when window exists)
    if (isProd && typeof window !== 'undefined') {
      try {
        performance = getPerformance(app);
        console.log('✅ Firebase Performance initialized');
      } catch (err) {
        console.warn('Firebase Performance init failed:', err);
      }
    }
  } else {
    console.warn('⚠️ Firebase not configured. Push notifications will be disabled.');
    console.warn('Add Firebase credentials to .env file to enable push notifications');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.warn('Continuing without Firebase services...');
}

// Export Firebase instances
export { app, messaging, analytics, performance };

// Push notification helpers
export async function requestNotificationPermission(): Promise<string | null> {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.warn('⚠️ Notification permission denied');
      return null;
    }

    console.log('✅ Notification permission granted');

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn('VAPID key not configured (VITE_FIREBASE_VAPID_KEY). Skipping getToken.');
      return null;
    }

    try {
      const token = await getToken(messaging, { vapidKey });
      console.log('FCM Token:', token);
      return token;
    } catch (err) {
      console.error('Error getting FCM token:', err);
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

// Listen for foreground messages
export function onMessageListener(callback: (payload: any) => void): void {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
}

// Analytics helpers
export function logAnalyticsEvent(
  eventName: string,
  eventParams?: Record<string, any>
): void {
  if (!analytics) {
    return; // Silently skip if analytics not initialized
  }

  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
}

// Common analytics events
export const AnalyticsEvents = {
  // User events
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Ride events
  BOOK_RIDE: 'book_ride',
  CANCEL_RIDE: 'cancel_ride',
  COMPLETE_RIDE: 'complete_ride',
  RATE_RIDE: 'rate_ride',
  
  // Driver events
  OFFER_RIDE: 'offer_ride',
  ACCEPT_BOOKING: 'accept_booking',
  START_TRIP: 'start_trip',
  END_TRIP: 'end_trip',
  
  // Payment events
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
  
  // App events
  PAGE_VIEW: 'page_view',
  SEARCH: 'search',
  SHARE: 'share',
  
  // Error events
  ERROR_OCCURRED: 'error_occurred',
};

// Check if Firebase is configured
export function isFirebaseEnabled(): boolean {
  return app !== null;
}

// Check if messaging is available
export function isMessagingEnabled(): boolean {
  return messaging !== null;
}

// Check if analytics is available
export function isAnalyticsEnabled(): boolean {
  return analytics !== null;
}

export default app;
