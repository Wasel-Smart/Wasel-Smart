import { supabase } from './supabase';

export const seedDatabase = async () => {
    console.log('Seeding Database...');

    // Clear existing data (optional, but good for a fresh start)
    localStorage.removeItem('mock_supabase_db');
    localStorage.removeItem('mock_supabase_users');
    // localStorage.removeItem('mock_supabase_session'); // Do not clear session to avoid logout

    // 1. Seed Users (for Auth)
    const mockUsers = [
        {
            id: 'user-driver-1',
            email: 'driver@wassel.com',
            password: 'password123',
            user_metadata: { full_name: 'Ahmed Driver', role: 'driver' }
        },
        {
            id: 'user-passenger-1',
            email: 'passenger@wassel.com',
            password: 'password123',
            user_metadata: { full_name: 'Sara Passenger', role: 'passenger' }
        },
        {
            id: 'user-admin-1',
            email: 'admin@wassel.com',
            password: 'password123',
            user_metadata: { full_name: 'Wassel Admin', role: 'admin' }
        }
    ];
    localStorage.setItem('mock_supabase_users', JSON.stringify(mockUsers));

    // 2. Seed Profiles
    const { data: profileData, error: profileError } = await supabase.from('profiles').insert([
        {
            id: 'user-driver-1',
            email: 'driver@wassel.com',
            full_name: 'Ahmed Driver',
            rating_as_driver: 4.8,
            trips_as_driver: 156,
            wallet_balance: 1500,
            is_verified: true,
            verification_level: 3,
            country: 'UAE',
            city: 'Dubai',
            language: 'en',
            currency: 'AED'
        },
        {
            id: 'user-passenger-1',
            email: 'passenger@wassel.com',
            full_name: 'Sara Passenger',
            rating_as_passenger: 4.9,
            trips_as_passenger: 42,
            wallet_balance: 350,
            is_verified: true,
            verification_level: 2,
            country: 'UAE',
            city: 'Sharjah',
            language: 'ar',
            currency: 'AED'
        },
        {
            id: 'user-admin-1',
            email: 'admin@wassel.com',
            full_name: 'Wassel Admin',
            is_verified: true,
            verification_level: 4,
            country: 'UAE',
            city: 'Abu Dhabi',
            language: 'en',
            currency: 'AED'
        }
    ]);

    if (profileError) console.error('Error seeding profiles:', profileError);

    // 3. Seed Trips
    const { data: tripData, error: tripError } = await supabase.from('trips').insert([
        {
            id: 'trip-1',
            driver_id: 'user-driver-1',
            trip_type: 'wasel',
            status: 'published',
            from_location: 'Dubai Mall',
            from_lat: 25.1972,
            from_lng: 55.2744,
            to_location: 'Abu Dhabi Mall',
            to_lat: 24.4920,
            to_lng: 54.3831,
            departure_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
            departure_time: '10:00',
            available_seats: 4,
            seats_booked: 1,
            price_per_seat: 50,
            luggage_allowed: true,
            instant_booking: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'trip-2',
            driver_id: 'user-driver-1',
            trip_type: 'raje3',
            status: 'published',
            from_location: 'Discovery Gardens',
            from_lat: 25.0412,
            from_lng: 55.1221,
            to_location: 'JBR',
            to_lat: 25.0768,
            to_lng: 55.1328,
            departure_date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
            departure_time: '18:30',
            available_seats: 2,
            seats_booked: 0,
            price_per_seat: 25,
            luggage_allowed: false,
            instant_booking: false,
            created_at: new Date().toISOString()
        }
    ]);

    if (tripError) console.error('Error seeding trips:', tripError);

    // 4. Seed Bookings
    const { data: bookingData, error: bookingError } = await supabase.from('bookings').insert([
        {
            id: 'booking-1',
            trip_id: 'trip-1',
            passenger_id: 'user-passenger-1',
            status: 'accepted',
            seats_requested: 1,
            total_price: 50,
            payment_status: 'completed',
            payment_method: 'wallet',
            created_at: new Date().toISOString()
        }
    ]);

    if (bookingError) console.error('Error seeding bookings:', bookingError);

    // 5. Seed Wallets
    const { data: walletData, error: walletError } = await supabase.from('wallets').insert([
        { id: 'wallet-1', user_id: 'user-driver-1', balance: 1500, currency: 'AED' },
        { id: 'wallet-2', user_id: 'user-passenger-1', balance: 350, currency: 'AED' }
    ]);

    // 6. Seed Notifications
    const { data: notifData, error: notifError } = await supabase.from('notifications').insert([
        {
            id: 'notif-1',
            user_id: 'user-driver-1',
            title: 'New Booking!',
            message: 'Sara Passenger booked a seat for your trip to Abu Dhabi.',
            type: 'trip_request',
            read_at: null,
            created_at: new Date().toISOString()
        },
        {
            id: 'notif-2',
            user_id: 'user-passenger-1',
            title: 'Booking Accepted',
            message: 'Ahmed Driver accepted your booking for the trip to Abu Dhabi.',
            type: 'trip_accepted',
            read_at: null,
            created_at: new Date().toISOString()
        }
    ]);

    // 7. Seed Messages
    await supabase.from('messages').insert([
        {
            id: 'msg-1',
            conversation_id: ['user-driver-1', 'user-passenger-1'].sort().join('_'),
            sender_id: 'user-driver-1',
            recipient_id: 'user-passenger-1',
            trip_id: 'trip-1',
            content: 'Hello Sara, I will be at the mall exit 3.',
            created_at: new Date().toISOString()
        },
        {
            id: 'msg-2',
            conversation_id: ['user-driver-1', 'user-passenger-1'].sort().join('_'),
            sender_id: 'user-passenger-1',
            recipient_id: 'user-driver-1',
            trip_id: 'trip-1',
            content: 'Great, see you there!',
            created_at: new Date(Date.now() + 60000).toISOString()
        }
    ]);

    // 8. Seed Transactions
    await supabase.from('transactions').insert([
        {
            id: 'tx-1',
            wallet_id: 'wallet-2',
            type: 'payment',
            amount: -50,
            status: 'completed',
            description: 'Trip to Abu Dhabi',
            created_at: new Date().toISOString()
        },
        {
            id: 'tx-2',
            wallet_id: 'wallet-1',
            type: 'earning',
            amount: 45,
            status: 'completed',
            description: 'Trip from Dubai Mall (after commission)',
            created_at: new Date().toISOString()
        }
    ]);

    // 9. Seed Vehicles
    await supabase.from('vehicles').insert([
        {
            id: 'vehicle-1',
            owner_id: 'user-driver-1',
            make: 'Tesla',
            model: 'Model 3',
            color: 'Midnight Silver',
            plate_number: 'DXB-WASEL-1',
            year: 2023,
            type: 'electric',
            is_verified: true
        }
    ]);

    // 10. Seed Referrals
    await supabase.from('referrals').insert([
        {
            id: 'ref-1',
            referrer_id: 'user-driver-1',
            code: 'DRIVER50',
            bonus_amount: 50,
            status: 'active',
            created_at: new Date().toISOString()
        }
    ]);

    // 11. Seed Badges/Stats
    await supabase.from('user_badges').insert([
        { id: 'badge-1', user_id: 'user-driver-1', badge_type: 'top_rated', awarded_at: new Date().toISOString() },
        { id: 'badge-2', user_id: 'user-driver-1', badge_type: 'eco_friendly', awarded_at: new Date().toISOString() }
    ]);

    console.log('Database seeded successfully!');
};
