import { useState, useEffect } from 'react';
import { useGeolocation } from './useGeolocation';

interface TripTracking {
  tripId: string;
  driverLocation: { lat: number; lng: number } | null;
  passengerLocation: { lat: number; lng: number } | null;
  status: 'waiting' | 'en_route' | 'arrived' | 'in_progress' | 'completed';
  estimatedArrival: string | null;
  distance: number | null;
}

export function useTripTracking(tripId: string | null) {
  const [tracking, setTracking] = useState<TripTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const { location } = useGeolocation();

  useEffect(() => {
    if (!tripId) return;

    setLoading(true);
    
    // Mock real-time tracking
    const mockTracking: TripTracking = {
      tripId,
      driverLocation: { lat: 25.2048, lng: 55.2708 },
      passengerLocation: location ? { lat: location.latitude, lng: location.longitude } : null,
      status: 'en_route',
      estimatedArrival: '5 minutes',
      distance: 2.3
    };

    setTracking(mockTracking);
    setLoading(false);

    // Simulate real-time updates
    const interval = setInterval(() => {
      setTracking(prev => {
        if (!prev) return null;
        
        // Simulate driver moving closer
        const newLat = prev.driverLocation!.lat + (Math.random() - 0.5) * 0.001;
        const newLng = prev.driverLocation!.lng + (Math.random() - 0.5) * 0.001;
        
        return {
          ...prev,
          driverLocation: { lat: newLat, lng: newLng },
          distance: Math.max(0.1, prev.distance! - 0.1)
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [tripId, location]);

  const updateTripStatus = (status: TripTracking['status']) => {
    setTracking(prev => prev ? { ...prev, status } : null);
  };

  return { tracking, loading, updateTripStatus };
}