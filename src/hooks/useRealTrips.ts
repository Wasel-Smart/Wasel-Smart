import { useState } from 'react';

interface Trip {
  id: string;
  driver_id: string;
  from: string;
  to: string;
  departure_date: string;
  departure_time: string;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  trip_type: 'wasel' | 'raje3';
  status: string;
  stops?: Array<{ lat: number; lng: number; label: string }>;
  preferences?: {
    smoking_allowed: boolean;
    pets_allowed: boolean;
    music_allowed: boolean;
  };
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    plate_number: string;
  };
  created_at: string;
  updated_at: string;
}

// Production mode - uses real backend
const DEMO_MODE = false;

export function useRealTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrip = async (tripData: Partial<Trip>) => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const newTrip: Trip = {
          id: Date.now().toString(),
          driver_id: 'demo-driver',
          from: tripData.from || 'Dubai',
          to: tripData.to || 'Abu Dhabi',
          departure_date: tripData.departure_date || new Date().toISOString().split('T')[0],
          departure_time: tripData.departure_time || '09:00',
          price_per_seat: tripData.price_per_seat || 50,
          total_seats: tripData.total_seats || 4,
          available_seats: tripData.available_seats || 4,
          trip_type: tripData.trip_type || 'wasel',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return { success: true, trip: newTrip };
      }
      throw new Error('Backend not configured');
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const searchTrips = async (params: {
    from?: string;
    to?: string;
    date?: string;
    seats?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const mockTrips: Trip[] = [
          {
            id: '1',
            driver_id: 'driver1',
            from: 'Dubai',
            to: 'Abu Dhabi',
            departure_date: '2024-01-15',
            departure_time: '09:00',
            price_per_seat: 45,
            total_seats: 4,
            available_seats: 3,
            trip_type: 'wasel',
            status: 'active',
            created_at: '2024-01-10T00:00:00Z',
            updated_at: '2024-01-10T00:00:00Z'
          }
        ];
        setTrips(mockTrips);
        return { success: true, trips: mockTrips };
      }
      throw new Error('Backend not configured');
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const getTrip = async (tripId: string) => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        const mockTrip: Trip = {
          id: tripId,
          driver_id: 'driver1',
          from: 'Dubai',
          to: 'Abu Dhabi',
          departure_date: '2024-01-15',
          departure_time: '09:00',
          price_per_seat: 45,
          total_seats: 4,
          available_seats: 3,
          trip_type: 'wasel',
          status: 'active',
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z'
        };
        return { success: true, trip: mockTrip };
      }
      throw new Error('Backend not configured');
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (tripId: string, updates: Partial<Trip>) => {
    setLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        return { success: true, trip: { id: tripId, ...updates } };
      }
      throw new Error('Backend not configured');
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    trips,
    loading,
    error,
    createTrip,
    searchTrips,
    getTrip,
    updateTrip,
  };
}
