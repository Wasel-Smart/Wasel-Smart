import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Web-specific real-time subscriptions
export class WebRealtimeService {
    private channels: Map<string, RealtimeChannel> = new Map();

    // Subscribe to messages for a specific conversation (trip)
    subscribeToConversationMessages(conversationId: string, callbacks: {
        onNewMessage?: (message: any) => void;
        onError?: (error: Error) => void;
    }) {
        const channelName = `conversation_${conversationId}`;

        // Clean up existing subscription
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    console.log('New message:', payload);
                    callbacks.onNewMessage?.(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to messages for conversation ${conversationId}`);
                } else if (status === 'CHANNEL_ERROR') {
                    callbacks.onError?.(new Error(`Failed to subscribe to messages for conversation ${conversationId}`));
                }
            });

        this.channels.set(channelName, channel);
        return channelName;
    }

    // Subscribe to trip updates (for drivers and passengers)
    subscribeToTripUpdates(tripId: string, callbacks: {
        onTripUpdate?: (trip: any) => void;
        onBookingUpdate?: (booking: any) => void;
        onError?: (error: Error) => void;
    }) {
        const channelName = `trip_${tripId}`;

        // Clean up existing subscription
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'trips',
                    filter: `id=eq.${tripId}`
                },
                (payload) => {
                    console.log('Trip update:', payload);
                    callbacks.onTripUpdate?.(payload.new);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `trip_id=eq.${tripId}`
                },
                (payload) => {
                    console.log('Booking update:', payload);
                    callbacks.onBookingUpdate?.(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to trip ${tripId} updates`);
                } else if (status === 'CHANNEL_ERROR') {
                    callbacks.onError?.(new Error(`Failed to subscribe to trip ${tripId}`));
                }
            });

        this.channels.set(channelName, channel);
        return channelName;
    }

    // Subscribe to notifications
    subscribeToNotifications(userId: string, callbacks: {
        onNewNotification?: (notification: any) => void;
        onError?: (error: Error) => void;
    }) {
        const channelName = `notifications_${userId}`;

        // Clean up existing subscription
        this.unsubscribe(channelName);

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                (payload) => {
                    console.log('New notification:', payload);
                    callbacks.onNewNotification?.(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to notifications for user ${userId}`);
                } else if (status === 'CHANNEL_ERROR') {
                    callbacks.onError?.(new Error(`Failed to subscribe to notifications for user ${userId}`));
                }
            });

        this.channels.set(channelName, channel);
        return channelName;
    }

    // Unsubscribe from a specific channel
    unsubscribe(channelName: string) {
        const channel = this.channels.get(channelName);
        if (channel) {
            supabase.removeChannel(channel);
            this.channels.delete(channelName);
        }
    }

    // Unsubscribe from all channels
    unsubscribeAll() {
        for (const [channelName, channel] of this.channels) {
            supabase.removeChannel(channel);
        }
        this.channels.clear();
    }

    // Get connection status
    getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
        // This is a simplified status check
        // In a real app, you'd track the actual connection state
        return 'connected';
    }
}

// Singleton instance
export const webRealtime = new WebRealtimeService();