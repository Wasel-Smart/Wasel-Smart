import { useState, useEffect } from 'react';
import { CalendarDays, Locate, UsersRound, MoveRight, Radar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { LiveTripMap } from './LiveTripMap';
import { bookingsAPI, tripsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { VisualRoute } from './VisualRoute';

export function MyTrips() {
  const { user } = useAuth();
  const [selectedTripForTracking, setSelectedTripForTracking] = useState<any>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
  const [driverTrips, setDriverTrips] = useState<any[]>([]);
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // Fetch passenger bookings
        const { bookings } = await bookingsAPI.getUserBookings();
        setUpcomingTrips(bookings.filter((b: any) => b.status !== 'completed' && b.status !== 'cancelled'));
        setCompletedTrips(bookings.filter((b: any) => b.status === 'completed'));

        // Fetch driver trips
        const { trips } = await tripsAPI.getDriverTrips(user.id);
        setDriverTrips(trips);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleTrackTrip = (trip: any) => {
    setSelectedTripForTracking(trip);
    setTrackingDialogOpen(true);
  };

  const handleLocationShare = (location: { lat: number; lng: number }) => {
    console.log('Location shared:', location);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1>My Trips</h1>
        <p className="text-gray-600">Manage your upcoming and past journeys</p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="as-driver">As Driver</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTrips.map((trip) => (
            <Card key={trip.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side: Info */}
                  <div className="flex-1 space-y-4">
                    {/* Trip Info */}
                    <VisualRoute from={trip.trip?.from_location} to={trip.trip?.to_location} />

                    <div className="pl-12 flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        <span>{trip.trip?.departure_date} at {trip.trip?.departure_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UsersRound className="w-4 h-4" />
                        <span>{trip.seats_requested} seats</span>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="flex items-center gap-3 pt-3 border-t dark:border-gray-700">
                      <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <span className="text-xs font-bold uppercase">
                          {trip.trip?.driver?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'DR'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{trip.trip?.driver?.full_name || 'Anonymous Driver'}</p>
                        <p className="text-xs text-muted-foreground">★ {trip.trip?.driver?.rating_as_driver || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Price & Actions */}
                  <div className="flex lg:flex-col items-end justify-between lg:justify-start gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">AED {trip.total_price}</div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total paid</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTrackTrip(trip)}
                        className="gap-1"
                      >
                        <Radar className="w-3 h-3" />
                        Track Live
                      </Button>
                      <Button variant="outline" size="sm">Contact Driver</Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="as-driver" className="space-y-4">
          {driverTrips.map((trip) => (
            <Card key={trip.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left Side: Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={trip.type === 'wasel' ? 'default' : 'secondary'}>
                        {trip.type === 'wasel' ? 'Wasel (واصل)' : 'Raje3 (راجع)'}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <VisualRoute from={trip.from_location} to={trip.to_location} />
                    </div>

                    <div className="pl-12 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CalendarDays className="w-4 h-4" />
                      <span>{trip.departure_date} at {trip.departure_time}</span>
                    </div>

                    <div className="pt-3 border-t dark:border-gray-700">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Capacity & Earnings</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <UsersRound className="w-4 h-4 text-teal-600" />
                          <span className="text-sm font-medium">{trip.seats_booked || 0} / {trip.available_seats} Booked</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-teal-600">AED {trip.price_per_seat} / seat</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Earnings & Actions */}
                  <div className="flex lg:flex-col items-end justify-between lg:justify-start gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600 uppercase tracking-tighter">
                        AED {(trip.seats_booked || 0) * trip.price_per_seat}
                      </div>
                      <p className="text-xs text-muted-foreground font-semibold uppercase">Current Earnings</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        Cancel Trip
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTrips.map((trip) => (
            <Card key={trip.id} className="opacity-75">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Completed
                      </Badge>
                      <Badge variant={trip.trip?.type === 'wasel' ? 'default' : 'secondary'}>
                        {trip.trip?.type === 'wasel' ? 'Wasel' : 'Raje3'}
                      </Badge>
                    </div>

                    <div className="mb-2">
                      <VisualRoute from={trip.trip?.from_location} to={trip.trip?.to_location} compact />
                    </div>

                    <p className="text-sm text-gray-600 ml-8">{trip.trip?.departure_date}</p>
                  </div>

                  <div className="flex lg:flex-col items-end justify-between lg:justify-start gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-600">AED {trip.total_price}</div>
                    </div>
                    <Button variant="outline" size="sm">Rate Driver</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Live Tracking Dialog */}
      {
        selectedTripForTracking && (
          <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Live Trip Tracking</DialogTitle>
              </DialogHeader>
              <LiveTripMap
                tripId={selectedTripForTracking.id.toString()}
                route={selectedTripForTracking.route || []}
                isDriver={false}
                allowLocationSharing={true}
                onShareLocation={handleLocationShare}
              />
            </DialogContent>
          </Dialog>
        )
      }
    </div >
  );
}