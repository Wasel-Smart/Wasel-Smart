/**
 * Real-Time Tracking Service
 * 
 * Handles live GPS tracking using Supabase Realtime channels.
 * Supports driver location updates and passenger tracking.
 */

import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface LocationUpdate {
  userId: string;
  tripId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  heading: number; // degrees
  speed: number; // km/h
  accuracy: number; // meters
  timestamp: string;
}

export interface TripStatus {
  tripId: string;
  status: 'waiting' | 'arriving' | 'picked_up' | 'in_progress' | 'completed' | 'cancelled';
  eta: Date | null;
  distance: number; // meters to destination
  duration: number; // seconds to destination
}

class RealTimeTrackingService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private locationWatchId: number | null = null;
  private currentTripId: string | null = null;

  // ============ LOCATION TRACKING ============

  /**
   * Start tracking user's location
   */
  startLocationTracking(
    tripId: string,
    onUpdate: (location: GeolocationPosition) => void,
    onError?: (error: GeolocationPositionError) => void
  ): boolean {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return false;
    }

    this.currentTripId = tripId;

    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        onUpdate(position);
        this.broadcastLocation(tripId, position);
      },
      (error) => {
        console.error('Location error:', error);
        onError?.(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return true;
  }

  /**
   * Stop tracking location
   */
  stopLocationTracking(): void {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
    this.currentTripId = null;
  }

  /**
   * Broadcast location to database
   */
  private async broadcastLocation(
    tripId: string,
    position: GeolocationPosition
  ): Promise<void> {
    const locationUpdate: LocationUpdate = {
      userId: (await supabase.auth.getUser()).data.user?.id || '',
      tripId,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      heading: position.coords.heading || 0,
      speed: position.coords.speed || 0,
      accuracy: position.coords.accuracy,
      timestamp: new Date().toISOString(),
    };

    try {
      await supabase.from('live_locations').upsert({
        trip_id: tripId,
        user_id: locationUpdate.userId,
        coordinates: locationUpdate.coordinates,
        heading: locationUpdate.heading,
        speed: locationUpdate.speed,
        accuracy: locationUpdate.accuracy,
        updated_at: locationUpdate.timestamp,
      });
    } catch (error) {
      console.error('Failed to broadcast location:', error);
    }
  }

  // ============ REALTIME SUBSCRIPTIONS ============

  /**
   * Subscribe to driver location updates
   */
  subscribeToDriverLocation(
    tripId: string,
    driverId: string,
    onUpdate: (location: LocationUpdate) => void
  ): () => void {
    const channelName = `trip:${tripId}:driver:${driverId}`;

    if (this.channels.has(channelName)) {
      console.warn('Already subscribed to driver location');
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_locations',
          filter: `trip_id=eq.${tripId},user_id=eq.${driverId}`,
        },
        (payload) => {
          const location: LocationUpdate = {
            userId: payload.new.user_id,
            tripId: payload.new.trip_id,
            coordinates: payload.new.coordinates,
            heading: payload.new.heading,
            speed: payload.new.speed,
            accuracy: payload.new.accuracy,
            timestamp: payload.new.updated_at,
          };
          onUpdate(location);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to trip status updates
   */
  subscribeToTripStatus(
    tripId: string,
    onUpdate: (status: TripStatus) => void
  ): () => void {
    const channelName = `trip:${tripId}:status`;

    if (this.channels.has(channelName)) {
      console.warn('Already subscribed to trip status');
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trips',
          filter: `id=eq.${tripId}`,
        },
        (payload) => {
          const status: TripStatus = {
            tripId: payload.new.id,
            status: payload.new.status,
            eta: payload.new.eta ? new Date(payload.new.eta) : null,
            distance: payload.new.distance_remaining || 0,
            duration: payload.new.duration_remaining || 0,
          };
          onUpdate(status);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to all passengers in a trip (for driver)
   */
  subscribeToPassengers(
    tripId: string,
    onUpdate: (passengers: LocationUpdate[]) => void
  ): () => void {
    const channelName = `trip:${tripId}:passengers`;

    if (this.channels.has(channelName)) {
      console.warn('Already subscribed to passengers');
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations',
          filter: `trip_id=eq.${tripId}`,
        },
        async () => {
          // Fetch all passenger locations
          const { data } = await supabase
            .from('live_locations')
            .select('*')
            .eq('trip_id', tripId);

          if (data) {
            const locations: LocationUpdate[] = data.map((row) => ({
              userId: row.user_id,
              tripId: row.trip_id,
              coordinates: row.coordinates,
              heading: row.heading,
              speed: row.speed,
              accuracy: row.accuracy,
              timestamp: row.updated_at,
            }));
            onUpdate(locations);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Unsubscribe from a channel
   */
  private async unsubscribe(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  async unsubscribeAll(): Promise<void> {
    for (const [channelName] of this.channels) {
      await this.unsubscribe(channelName);
    }
    this.stopLocationTracking();
  }

  // ============ TRIP STATUS UPDATES ============

  /**
   * Update trip status
   */
  async updateTripStatus(
    tripId: string,
    status: TripStatus['status'],
    eta?: Date,
    distance?: number,
    duration?: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('trips')
        .update({
          status,
          eta: eta?.toISOString(),
          distance_remaining: distance,
          duration_remaining: duration,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tripId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to update trip status:', error);
      return false;
    }
  }

  /**
   * Calculate ETA based on current location and destination
   */
  calculateETA(
    currentLocation: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    currentSpeed: number
  ): { eta: Date; distance: number; duration: number } {
    // Haversine formula for distance
    const R = 6371e3; // Earth radius in meters
    const φ1 = (currentLocation.lat * Math.PI) / 180;
    const φ2 = (destination.lat * Math.PI) / 180;
    const Δφ = ((destination.lat - currentLocation.lat) * Math.PI) / 180;
    const Δλ = ((destination.lng - currentLocation.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    const speed = currentSpeed > 0 ? currentSpeed / 3.6 : 13.89; // Convert km/h to m/s, default 50 km/h
    const duration = distance / speed;

    const eta = new Date(Date.now() + duration * 1000);

    return {
      eta,
      distance: Math.round(distance),
      duration: Math.round(duration),
    };
  }

  // ============ EMERGENCY SOS ============

  /**
   * Send emergency SOS alert
   */
  async sendEmergencySOS(
    tripId: string,
    location: { lat: number; lng: number },
    reason?: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');

      // Create emergency alert
      const { error } = await supabase.from('emergency_alerts').insert({
        trip_id: tripId,
        user_id: user.id,
        location,
        reason,
        status: 'active',
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Notify emergency services and trip participants
      await this.notifyEmergencyContacts(tripId, user.id, location);

      return true;
    } catch (error) {
      console.error('Failed to send SOS:', error);
      return false;
    }
  }

  private async notifyEmergencyContacts(
    tripId: string,
    userId: string,
    location: { lat: number; lng: number }
  ): Promise<void> {
    // In production, this would:
    // 1. Notify emergency services
    // 2. Notify trip driver/passengers
    // 3. Notify user's emergency contacts
    // 4. Send location to authorities
    
    console.log('Emergency SOS triggered:', { tripId, userId, location });
    
    // TODO: Integrate with emergency services API
    // TODO: Send push notifications
    // TODO: Send SMS to emergency contacts
  }

  // ============ GEOFENCING ============

  /**
   * Check if location is within geofence
   */
  isWithinGeofence(
    location: { lat: number; lng: number },
    center: { lat: number; lng: number },
    radiusMeters: number
  ): boolean {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (location.lat * Math.PI) / 180;
    const φ2 = (center.lat * Math.PI) / 180;
    const Δφ = ((center.lat - location.lat) * Math.PI) / 180;
    const Δλ = ((center.lng - location.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return distance <= radiusMeters;
  }

  /**
   * Monitor for pickup zone arrival
   */
  monitorPickupZone(
    tripId: string,
    pickupLocation: { lat: number; lng: number },
    radiusMeters: number = 100,
    onArrival: () => void
  ): () => void {
    const intervalId = setInterval(async () => {
      // Get current driver location
      const { data } = await supabase
        .from('live_locations')
        .select('coordinates')
        .eq('trip_id', tripId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data && data.coordinates) {
        const isWithin = this.isWithinGeofence(
          data.coordinates,
          pickupLocation,
          radiusMeters
        );

        if (isWithin) {
          onArrival();
          clearInterval(intervalId);
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }
}

export const realTimeTrackingService = new RealTimeTrackingService();
