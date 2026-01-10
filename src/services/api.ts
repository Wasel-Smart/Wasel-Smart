// Real API mode - Supabase backend configured
// DEMO_MODE is now dynamically determined from supabase configuration
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Re-export DEMO_MODE for compatibility (false when Supabase is configured)
export const DEMO_MODE = !isSupabaseConfigured;

// Mock data for demo mode
const mockTrips = [
  {
    id: '1',
    driver_id: 'driver1',
    from: 'Dubai',
    to: 'Abu Dhabi',
    departure_date: '2024-01-15',
    departure_time: '09:00',
    available_seats: 3,
    price_per_seat: 45,
    status: 'active',
    driver: { name: 'Ahmed Hassan', rating: 4.8, trips: 156, initials: 'AH' }
  },
  {
    id: '2',
    driver_id: 'driver2',
    from: 'Riyadh',
    to: 'Jeddah',
    departure_date: '2024-01-16',
    departure_time: '14:30',
    available_seats: 2,
    price_per_seat: 65,
    status: 'active',
    driver: { name: 'Omar Al-Rashid', rating: 4.9, trips: 203, initials: 'OR' }
  }
];

const mockBookings = [
  {
    id: '1',
    trip_id: '1',
    user_id: '1',
    seats_requested: 1,
    status: 'confirmed',
    created_at: '2024-01-10'
  }
];

// Mock API functions
const mockAPI = {
  async getAuthDetails() {
    return { token: 'mock-token', userId: 'user-1' };
  },
  
  authAPI: {
    async signUp(email: string, password: string, fullName: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) throw error;
      return { user: data.user, session: data.session };
    },
    async signIn(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { user: data.user, session: data.session };
    },
    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return {};
    },
    async getSession() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session };
    },
    async getUser() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user };
    },
    async getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { profile: null };
      
      // Try to get profile from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return { profile: profile || { id: user.id, email: user.email, ...user.user_metadata } };
    },
    async updateProfile(updates: { full_name?: string; phone?: string; avatar_url?: string }) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, profile: data };
    }
  },
  
  tripsAPI: {
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to create trips');
      
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
      
      if (error) throw error;
      return { trip: data };
    },
    async searchTrips(from?: string, to?: string, date?: string, seats?: number) {
      let query = supabase
        .from('trips')
        .select(`
          *,
          driver:profiles!trips_driver_id_fork (id, full_name, rating, trips_completed, avatar_url)
        `)
        .eq('status', 'active');
      
      if (from) query = query.ilike('from', `%${from}%`);
      if (to) query = query.ilike('to', `%${to}%`);
      if (date) query = query.eq('departure_date', date);
      if (seats) query = query.gte('available_seats', seats);
      
      const { data, error } = await query.order('departure_date', { ascending: true });
      if (error) throw error;
      
      return { trips: data || [] };
    },
    async getTripById(tripId: string) {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          driver:profiles!trips_driver_id_fork (id, full_name, rating, trips_completed, avatar_url)
        `)
        .eq('id', tripId)
        .single();
      
      if (error) throw error;
      return { trip: data };
    },
    async getDriverTrips(driverId?: string) {
      const { data: { user } } = await supabase.auth.getUser();
      const targetDriverId = driverId || user?.id;
      
      if (!targetDriverId) throw new Error('Driver ID required');
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('driver_id', targetDriverId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { trips: data || [] };
    },
    async calculatePrice(type: string, weight?: number, distance_km?: number, base_price?: number) {
      // Pricing logic for different service types
      const pricing = {
        passenger: { base: 10, per_km: 1.5 },
        freight: { base: 50, per_km: 3 },
        package: { base: 15, per_km: 2 },
        rental: { base: 100, per_day: 200 }
      };
      
      const rates = pricing[type as keyof typeof pricing] || pricing.passenger;
      const distance = distance_km || 0;
      const price = base_price || (rates.base + (rates.per_km || 0) * distance);
      
      return { 
        price: Math.round(price * 100) / 100,
        breakdown: { 
          base: rates.base, 
          distance: distance * (rates.per_km || 0),
          total: price
        }
      };
    }
  },
  
  bookingsAPI: {
    async createBooking(tripId: string, seatsRequested: number, pickup?: string, dropoff?: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to book');
      
      // Get trip details
      const { data: trip } = await supabase
        .from('trips')
        .select('available_seats, price_per_seat')
        .eq('id', tripId)
        .single();
      
      if (!trip) throw new Error('Trip not found');
      if (trip.available_seats < seatsRequested) throw new Error('Not enough seats available');
      
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
      
      if (error) throw error;
      return { booking: data };
    },
    async getUserBookings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          trip:trips (
            *,
            driver:profiles!trips_driver_id_fork (id, full_name, rating, phone)
          )
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { bookings: data || [] };
    },
    async getTripBookings(tripId: string) {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          passenger:profiles!bookings_passenger_id_fork (id, full_name, phone, avatar_url)
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return { bookings: data || [] };
    },
    async updateBookingStatus(bookingId: string, status: string) {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single();
      
      if (error) throw error;
      return { booking: data };
    }
  },
  
  messagesAPI: {
    async sendMessage(recipientId: string, tripId: string, content: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to send messages');
      
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
      
      if (error) throw error;
      return { message: data };
    },
    async getConversations() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      
      // Get unique conversation IDs where user is participant
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fork (id, full_name, avatar_url),
          recipient:profiles!messages_recipient_id_fork (id, full_name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
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
    },
    async getConversationWithUser(otherUserId: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      
      const conversationId = [user.id, otherUserId].sort().join('_');
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fork (id, full_name, avatar_url),
          recipient:profiles!messages_recipient_id_fork (id, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return { messages: data || [] };
    }
  },
  
  walletAPI: {
    async getWallet() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      return { 
        wallet: data || { 
          user_id: user.id, 
          balance: 0, 
          currency: 'AED',
          created_at: new Date().toISOString()
        } 
      };
    },
    async addFunds(amount: number) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      
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
      
      if (error) throw error;
      
      // Record transaction
      await supabase.from('transactions').insert({
        wallet_id: data.id,
        type: 'deposit',
        amount,
        status: 'completed',
        created_at: new Date().toISOString()
      });
      
      return { success: true, new_balance: newBalance };
    }
  },
  
  notificationsAPI: {
    async getNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return { notifications: data || [] };
    },
    async markAsRead(notificationId: string) {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      if (error) throw error;
      return { success: true };
    }
  },
  
  referralAPI: {
    async getReferralCode() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      
      const { data, error } = await supabase
        .from('referrals')
        .select('*, earnings:transactions(amount)')
        .eq('referrer_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      const totalEarnings = data?.earnings?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) || 0;
      
      return { 
        referral_code: data?.code || `REF${user.id.slice(0, 6).toUpperCase()}`,
        earnings: totalEarnings
      };
    },
    async applyReferralCode(code: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');
      
      // Find the referrer
      const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('code', code)
        .single();
      
      if (!referral) throw new Error('Invalid referral code');
      if (referral.referrer_id === user.id) throw new Error('Cannot use your own referral code');
      
      // Check if user already used a referral
      const { data: existing } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_user_id', user.id)
        .single();
      
      if (existing) throw new Error('Referral code already used');
      
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
      
      if (error) throw error;
      
      return { success: true, bonus: 25 };
    }
  }
};

// Demo mode fallback API functions
const demoMockAPI = {
  async getAuthDetails() {
    return { token: 'mock-token', userId: 'user-1' };
  },
  
  authAPI: {
    async signUp() {
      return { success: true, user: { id: '1', email: 'demo@wassel.com' } };
    },
    async signIn() {
      return { user: { id: '1', email: 'demo@wassel.com' } };
    },
    async signOut() {
      return {};
    },
    async getSession() {
      return { session: { user: { id: '1' }, access_token: 'mock-token' } };
    },
    async getProfile() {
      return { profile: { id: '1', full_name: 'Demo User', email: 'demo@wassel.com' } };
    },
    async updateProfile(updates: any) {
      return { success: true, profile: { ...updates } };
    }
  },
  
  tripsAPI: {
    async createTrip(tripData: any) {
      const newTrip = { ...tripData, id: Date.now().toString(), status: 'active' };
      mockTrips.push(newTrip as any);
      return { trip: newTrip };
    },
    async searchTrips(from?: string, to?: string, date?: string, seats?: number) {
      let results = [...mockTrips];
      if (from) results = results.filter(t => t.from.toLowerCase().includes(from.toLowerCase()));
      if (to) results = results.filter(t => t.to.toLowerCase().includes(to.toLowerCase()));
      if (date) results = results.filter(t => t.departure_date >= date);
      if (seats) results = results.filter(t => t.available_seats >= seats);
      return { trips: results };
    },
    async getTripById(tripId: string) {
      const trip = mockTrips.find(t => t.id === tripId);
      return { trip };
    },
    async getDriverTrips() {
      return { trips: mockTrips.filter(t => t.driver_id === 'driver1') };
    },
    async calculatePrice(type: string, weight?: number, distance_km?: number, base_price?: number) {
      return { price: base_price || 50, breakdown: { base: 40, fees: 10 } };
    }
  },
  
  bookingsAPI: {
    async createBooking(tripId: string, seatsRequested: number, pickup?: string, dropoff?: string) {
      const booking = {
        id: Date.now().toString(),
        trip_id: tripId,
        user_id: 'user-1',
        seats_requested: seatsRequested,
        status: 'confirmed',
        pickup_stop: pickup,
        dropoff_stop: dropoff,
        created_at: new Date().toISOString()
      };
      mockBookings.push(booking as any);
      return { booking };
    },
    async getUserBookings() {
      return { bookings: mockBookings };
    },
    async getTripBookings(tripId: string) {
      return { bookings: mockBookings.filter(b => b.trip_id === tripId) };
    },
    async updateBookingStatus(bookingId: string, status: string) {
      const booking = mockBookings.find(b => b.id === bookingId);
      if (booking) booking.status = status;
      return { booking };
    }
  },
  
  messagesAPI: {
    async sendMessage(recipientId: string, tripId: string, content: string) {
      return { message: { id: Date.now().toString(), content, sent_at: new Date().toISOString() } };
    },
    async getConversations() {
      return { conversations: [] };
    },
    async getConversationWithUser(otherUserId: string) {
      return { messages: [] };
    }
  },
  
  walletAPI: {
    async getWallet() {
      return { wallet: { balance: 150.00, currency: 'AED' } };
    },
    async addFunds(amount: number) {
      return { success: true, new_balance: 150 + amount };
    }
  },
  
  notificationsAPI: {
    async getNotifications() {
      return { notifications: [{ id: '1', title: 'Welcome!', message: 'Demo mode active', read: false }] };
    },
    async markAsRead(notificationId: string) {
      return { success: true };
    }
  },
  
  referralAPI: {
    async getReferralCode() {
      return { referral_code: 'DEMO123', earnings: 25.00 };
    },
    async applyReferralCode(code: string) {
      return { success: true, bonus: 10.00 };
    }
  }
};

// Use real or demo APIs based on Supabase configuration
const activeAPI = DEMO_MODE ? demoMockAPI : mockAPI;

// Export APIs
export const authAPI = activeAPI.authAPI;
export const tripsAPI = activeAPI.tripsAPI;
export const bookingsAPI = activeAPI.bookingsAPI;
export const messagesAPI = activeAPI.messagesAPI;
export const walletAPI = activeAPI.walletAPI;
export const notificationsAPI = activeAPI.notificationsAPI;
export const referralAPI = activeAPI.referralAPI;

// Legacy exports for compatibility
export const getAuthDetails = activeAPI.getAuthDetails;
export const calculatePrice = activeAPI.tripsAPI.calculatePrice;

// Re-export supabase for direct access when needed
export { supabase };
