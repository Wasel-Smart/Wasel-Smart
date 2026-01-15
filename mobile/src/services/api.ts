import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Mobile-specific error handling
class MobileAPIError extends Error {
    constructor(
        message: string,
        public code?: string,
        public statusCode?: number,
        public retryable: boolean = false
    ) {
        super(message);
        this.name = 'MobileAPIError';
    }
}

// Retry configuration for mobile
const RETRY_CONFIG = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2,
};

// Network status check for mobile
const isNetworkAvailable = async (): Promise<boolean> => {
    // In a real app, you'd use NetInfo from @react-native-community/netinfo
    // For now, we'll assume network is available
    return true;
};

// Retry utility for mobile
const withRetry = async <T>(
    operation: () => Promise<T>,
    config = RETRY_CONFIG
): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
            // Check network before attempting
            const networkAvailable = await isNetworkAvailable();
            if (!networkAvailable) {
                throw new MobileAPIError(
                    'No internet connection',
                    'NETWORK_ERROR',
                    0,
                    true
                );
            }

            return await operation();
        } catch (error) {
            lastError = error as Error;

            // Don't retry if it's not a retryable error
            if (error instanceof MobileAPIError && !error.retryable) {
                throw error;
            }

            // Don't retry on the last attempt
            if (attempt === config.maxRetries) {
                break;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(
                config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
                config.maxDelay
            );

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
};

// Auth API for mobile
export const authAPI = {
    async signUp(email: string, password: string, fullName: string) {
        return withRetry(async () => {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } }
            });
            if (error) throw new MobileAPIError(error.message, error.status?.toString(), parseInt(error.status?.toString() || '0'));
            return { user: data.user, session: data.session };
        });
    },

    async signIn(email: string, password: string) {
        return withRetry(async () => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw new MobileAPIError(error.message, error.status?.toString(), parseInt(error.status?.toString() || '0'));
            return { user: data.user, session: data.session };
        });
    },

    async signOut() {
        return withRetry(async () => {
            const { error } = await supabase.auth.signOut();
            if (error) throw new MobileAPIError(error.message, error.status?.toString(), parseInt(error.status?.toString() || '0'));
            return {};
        });
    },

    async resetPasswordForEmail(email: string) {
        return withRetry(async () => {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'wasel://auth/reset-password',
            });
            if (error) throw new MobileAPIError(error.message, error.status?.toString(), parseInt(error.status?.toString() || '0'));
            return { success: true };
        });
    },

    async getSession() {
        return withRetry(async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw new MobileAPIError(error.message, error.status?.toString(), parseInt(error.status?.toString() || '0'));
            return { session };
        });
    },

    async getUser() {
        return withRetry(async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw new MobileAPIError(error.message, error.status?.toString(), parseInt(error.status?.toString() || '0'));
            return { user };
        });
    },

    async getProfile() {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return { profile: null };

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw new MobileAPIError(error.message, error.code);
            return { profile: profile || { id: user.id, email: user.email, ...user.user_metadata } };
        });
    },

    async updateProfile(updates: { full_name?: string; phone?: string; avatar_url?: string }) {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Not authenticated', 'AUTH_ERROR', 401);

            const { data, error } = await supabase
                .from('profiles')
                .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
                .select()
                .single();

            if (error) throw new MobileAPIError(error.message, error.code);
            return { success: true, profile: data };
        });
    }
};

// Trips API for mobile
export const tripsAPI = {
    async createTrip(tripData: {
        from: string;
        to: string;
        departure_date: string;
        departure_time: string;
        available_seats: number;
        price_per_seat: number;
        vehicle_type?: string;
        notes?: string;
    }) {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in to create trips', 'AUTH_ERROR', 401);

            const { data, error } = await supabase
                .from('trips')
                .insert({
                    driver_id: user.id,
                    ...tripData,
                    status: 'active',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw new MobileAPIError(error.message, error.code);
            return { trip: data };
        });
    },

    async searchTrips(from?: string, to?: string, date?: string, seats?: number) {
        return withRetry(async () => {
            let query = supabase
                .from('trips')
                .select(`
          *,
          driver:profiles!trips_driver_id_fkey (id, full_name, rating, trips_completed, avatar_url)
        `)
                .eq('status', 'active');

            if (from) query = query.ilike('from', `%${from}%`);
            if (to) query = query.ilike('to', `%${to}%`);
            if (date) query = query.eq('departure_date', date);
            if (seats) query = query.gte('available_seats', seats);

            const { data, error } = await query.order('departure_date', { ascending: true });
            if (error) throw new MobileAPIError(error.message, error.code);
            return { trips: data || [] };
        });
    },

    async getTripById(tripId: string) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('trips')
                .select(`
          *,
          driver:profiles!trips_driver_id_fkey (id, full_name, rating, trips_completed, avatar_url)
        `)
                .eq('id', tripId)
                .single();

            if (error) throw new MobileAPIError(error.message, error.code);
            return { trip: data };
        });
    },

    async getDriverTrips(driverId?: string) {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const targetDriverId = driverId || user?.id;

            if (!targetDriverId) throw new MobileAPIError('Driver ID required', 'VALIDATION_ERROR', 400);

            const { data, error } = await supabase
                .from('trips')
                .select('*')
                .eq('driver_id', targetDriverId)
                .order('created_at', { ascending: false });

            if (error) throw new MobileAPIError(error.message, error.code);
            return { trips: data || [] };
        });
    },

    async updateTrip(tripId: string, updates: any) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('trips')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', tripId)
                .select()
                .single();

            if (error) throw new MobileAPIError(error.message, error.code);
            return { trip: data };
        });
    },

    calculatePrice(type: string, weight?: number, distance_km?: number, base_price?: number) {
        // Pricing logic for different service types
        const pricing = {
            passenger: { base: 10, per_km: 1.5 },
            freight: { base: 50, per_km: 3 },
            package: { base: 15, per_km: 2 },
            rental: { base: 100, per_day: 200 }
        };

        const rates = pricing[type as keyof typeof pricing] || pricing.passenger;
        const distance = distance_km || 0;

        let price = base_price || rates.base;
        if ('per_km' in rates) {
            price += rates.per_km * distance;
        } else if ('per_day' in rates) {
            price += rates.per_day; // Assuming 1 day for simplicity
        }

        return {
            price: Math.round(price * 100) / 100,
            breakdown: {
                base: rates.base,
                distance: 'per_km' in rates ? distance * rates.per_km : 0,
                total: price
            }
        };
    }
};

// Bookings API for mobile
export const bookingsAPI = {
    async createBooking(tripId: string, seatsRequested: number, pickup?: string, dropoff?: string) {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in to book', 'AUTH_ERROR', 401);

            // Get trip details
            const { data: trip, error: tripError } = await supabase
                .from('trips')
                .select('available_seats, price_per_seat')
                .eq('id', tripId)
                .single();

            if (tripError) throw new MobileAPIError(tripError.message, tripError.code);
            if (!trip) throw new MobileAPIError('Trip not found', 'NOT_FOUND', 404);
            if (trip.available_seats < seatsRequested) throw new MobileAPIError('Not enough seats available', 'VALIDATION_ERROR', 400);

            const { data, error } = await supabase
                .from('bookings')
                .insert({
                    trip_id: tripId,
                    passenger_id: user.id,
                    seats_requested: seatsRequested,
                    pickup_stop: pickup,
                    dropoff_stop: dropoff,
                    total_price: trip.price_per_seat * seatsRequested,
                    status: 'pending',
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw new MobileAPIError(error.message, error.code);
            return { booking: data };
        });
    },

    async getUserBookings() {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in', 'AUTH_ERROR', 401);

            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          trip:trips (
            *,
            driver:profiles!trips_driver_id_fkey (id, full_name, rating, phone)
          )
        `)
                .eq('passenger_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw new MobileAPIError(error.message, error.code);
            return { bookings: data || [] };
        });
    },

    async getTripBookings(tripId: string) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          *,
          passenger:profiles!bookings_passenger_id_fkey (id, full_name, phone, avatar_url)
        `)
                .eq('trip_id', tripId)
                .order('created_at', { ascending: true });

            if (error) throw new MobileAPIError(error.message, error.code);
            return { bookings: data || [] };
        });
    },

    async updateBookingStatus(bookingId: string, status: string) {
        return withRetry(async () => {
            const { data, error } = await supabase
                .from('bookings')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', bookingId)
                .select()
                .single();

            if (error) throw new MobileAPIError(error.message, error.code);
            return { booking: data };
        });
    },

    async cancelBooking(bookingId: string) {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in', 'AUTH_ERROR', 401);

            // 1. Get booking details to check payment and trip
            const { data: booking, error: fetchError } = await supabase
                .from('bookings')
                .select('*, trip:trips(available_seats)')
                .eq('id', bookingId)
                .single();

            if (fetchError || !booking) throw new MobileAPIError('Booking not found', 'NOT_FOUND', 404);

            if (booking.status === 'cancelled') {
                throw new MobileAPIError('Booking already cancelled', 'VALIDATION_ERROR', 400);
            }

            // 2. Process Refund if paid
            if (booking.payment_status === 'completed' && booking.payment_intent_id) {
                const { error: refundError } = await supabase.functions.invoke('refund', {
                    body: { payment_intent_id: booking.payment_intent_id }
                });

                if (refundError) {
                    console.error('Refund failed:', refundError);
                    // We continue cancellation but log manual refund needed? 
                    // For now, let's assume we proceed or throw error depending on policy.
                    // Let's warn but proceed.
                }
            }

            // 3. Update Booking Status
            const { data: updatedBooking, error: updateError } = await supabase
                .from('bookings')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', bookingId)
                .select()
                .single();

            if (updateError) throw new MobileAPIError(updateError.message, updateError.code);

            // 4. Restore Seats (Atomically increment)
            if (booking.trip_id) {
                // Try RPC first
                const { error: seatError } = await supabase.rpc('increment_seats', {
                    row_id: booking.trip_id,
                    count: booking.seats_requested
                });

                // Fallback for RPC if not exists: manual update (less safe)
                if (seatError) {
                    await supabase
                        .from('trips')
                        .update({ available_seats: booking.trip.available_seats + booking.seats_requested })
                        .eq('id', booking.trip_id);
                }
            }

            return { success: true, booking: updatedBooking };
        });
    }
};



// Messages API for mobile
export const messagesAPI = {
    async sendMessage(recipientId: string, tripId: string, content: string) {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in to send messages', 'AUTH_ERROR', 401);

            const conversationId = [user.id, recipientId].sort().join('_');

            const { data, error } = await supabase
                .from('messages')
                .insert({
                    conversation_id: conversationId,
                    sender_id: user.id,
                    recipient_id: recipientId,
                    trip_id: tripId,
                    content,
                    created_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw new MobileAPIError(error.message, error.code);
            return { message: data };
        });
    },

    async getConversations() {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in', 'AUTH_ERROR', 401);

            const { data: messages, error } = await supabase
                .from('messages')
                .select(`
          *,
          sender:profiles!messages_sender_id_fkey (id, full_name, avatar_url),
          recipient:profiles!messages_recipient_id_fkey (id, full_name, avatar_url)
        `)
                .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
                .order('created_at', { ascending: false });

            if (error) throw new MobileAPIError(error.message, error.code);

            // Group by conversation
            const conversations = new Map();
            messages?.forEach(msg => {
                const otherUser = msg.sender_id === user.id ? msg.recipient : msg.sender;
                const convId = [user.id, otherUser?.id].sort().join('_');
                if (!conversations.has(convId)) {
                    conversations.set(convId, {
                        id: convId,
                        other_user: otherUser,
                        last_message: msg,
                        unread_count: msg.sender_id !== user.id && !msg.read_at ? 1 : 0
                    });
                }
            });

            return { conversations: Array.from(conversations.values()) };
        });
    },

    async getConversationWithUser(otherUserId: string) {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in', 'AUTH_ERROR', 401);

            const conversationId = [user.id, otherUserId].sort().join('_');

            const { data, error } = await supabase
                .from('messages')
                .select(`
          *,
          sender:profiles!messages_sender_id_fkey (id, full_name, avatar_url),
          recipient:profiles!messages_recipient_id_fkey (id, full_name, avatar_url)
        `)
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (error) throw new MobileAPIError(error.message, error.code);
            return { messages: data || [] };
        });
    }
};

// Wallet API for mobile
export const walletAPI = {
    async getWallet() {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in', 'AUTH_ERROR', 401);

            const { data, error } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw new MobileAPIError(error.message, error.code);

            return {
                wallet: data || {
                    user_id: user.id,
                    balance: 0,
                    currency: 'AED',
                    created_at: new Date().toISOString()
                }
            };
        });
    },

    async addFunds(amount: number) {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in', 'AUTH_ERROR', 401);

            // First get current balance
            const { wallet } = await this.getWallet();
            const newBalance = wallet.balance + amount;

            const { data, error } = await supabase
                .from('wallets')
                .upsert({
                    user_id: user.id,
                    balance: newBalance,
                    currency: wallet.currency || 'AED',
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw new MobileAPIError(error.message, error.code);

            // Record transaction
            await supabase.from('transactions').insert({
                wallet_id: data.id,
                type: 'deposit',
                amount,
                status: 'completed',
                created_at: new Date().toISOString()
            });

            return { success: true, new_balance: newBalance };
        });
    }
};

// Notifications API for mobile
export const notificationsAPI = {
    async getNotifications() {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in', 'AUTH_ERROR', 401);

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw new MobileAPIError(error.message, error.code);
            return { notifications: data || [] };
        });
    },

    async markAsRead(notificationId: string) {
        return withRetry(async () => {
            const { error } = await supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('id', notificationId);

            if (error) throw new MobileAPIError(error.message, error.code);
            return { success: true };
        });
    }
};

// Referral API for mobile
export const referralAPI = {
    async getReferralCode() {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in', 'AUTH_ERROR', 401);

            const { data, error } = await supabase
                .from('referrals')
                .select('*, earnings:transactions(amount)')
                .eq('referrer_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw new MobileAPIError(error.message, error.code);

            const totalEarnings = data?.earnings?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0;

            return {
                referral_code: data?.code || `REF${user.id.slice(0, 6).toUpperCase()}`,
                earnings: totalEarnings
            };
        });
    },

    async applyReferralCode(code: string) {
        return withRetry(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new MobileAPIError('Must be logged in', 'AUTH_ERROR', 401);

            // Find the referrer
            const { data: referral } = await supabase
                .from('referrals')
                .select('*')
                .eq('code', code)
                .single();

            if (!referral) throw new MobileAPIError('Invalid referral code', 'VALIDATION_ERROR', 400);
            if (referral.referrer_id === user.id) throw new MobileAPIError('Cannot use your own referral code', 'VALIDATION_ERROR', 400);

            // Check if user already used a referral
            const { data: existing } = await supabase
                .from('referrals')
                .select('*')
                .eq('referred_user_id', user.id)
                .single();

            if (existing) throw new MobileAPIError('Referral code already used', 'VALIDATION_ERROR', 400);

            // Record the referral
            const { error } = await supabase
                .from('referrals')
                .insert({
                    referrer_id: referral.referrer_id,
                    referred_user_id: user.id,
                    code,
                    status: 'completed',
                    bonus_amount: 25,
                    created_at: new Date().toISOString()
                });

            if (error) throw new MobileAPIError(error.message, error.code);

            return { success: true, bonus: 25 };
        });
    }
};

// Export for compatibility
export { MobileAPIError };