import { StripeProvider } from '@stripe/stripe-react-native';
import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { View, ActivityIndicator } from 'react-native';

import { notificationService } from '../src/services';

export default function RootLayout() {
    const { session, initialized, initialize, user } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        initialize();
    }, []);

    useEffect(() => {
        if (user && session) {
            notificationService.registerForPushNotificationsAsync(user.id);
        }
    }, [user, session]);

    useEffect(() => {
        if (!initialized) return;

        const inAuthGroup = segments[0] === 'auth';

        if (!session && !inAuthGroup) {
            // Redirect to login if not authenticated and not in auth group
            router.replace('/auth/login');
        } else if (session && inAuthGroup) {
            // Redirect to home if authenticated and trying to access auth pages
            router.replace('/(tabs)');
        }
    }, [session, initialized, segments]);

    if (!initialized) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <StripeProvider
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
            merchantIdentifier="merchant.com.wasel.app"
        >
            <Slot />
        </StripeProvider>
    );
}