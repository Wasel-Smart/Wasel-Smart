import { useState, useEffect } from 'react';
import { bookingsAPI } from '../services/api';

export interface Booking {
  id: string;
  trip_id: string;
  user_id: string;
  seats_requested: number;
  status: string;
  pickup_stop?: string;
  dropoff_stop?: string;
  created_at: string;
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getUserBookings();
      setBookings(response.bookings || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (tripId: string, seatsRequested: number, pickup?: string, dropoff?: string) => {
    try {
      const result = await bookingsAPI.createBooking(tripId, seatsRequested, pickup, dropoff);
      await fetchBookings(); // Refresh list
      return { data: result.booking, error: null };
    } catch (err: any) {
      console.error('Error creating booking:', err);
      return { data: null, error: err.message };
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const result = await bookingsAPI.updateBookingStatus(bookingId, status);
      await fetchBookings(); // Refresh list
      return { data: result.booking, error: null };
    } catch (err: any) {
      console.error('Error updating booking:', err);
      return { data: null, error: err.message };
    }
  };

  return {
    bookings,
    loading,
    error,
    refresh: fetchBookings,
    createBooking,
    updateBookingStatus,
  };
}