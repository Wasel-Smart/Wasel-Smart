import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Plane,
    Train,
    Bus,
    Car,
    MapPin,
    Clock,
    DollarSign,
    ArrowRight,
    CheckCircle,
    AlertTriangle,
    Shuffle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/api';

interface TransportMode {
    id: string;
    name: string;
    type: 'flight' | 'train' | 'bus' | 'car';
    icon: React.ComponentType<any>;
    color: string;
    providers: string[];
}

interface JourneySegment {
    id: string;
    mode: TransportMode;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    duration: number; // minutes
    price: number;
    currency: string;
    provider: string;
    bookingRef?: string;
    status: 'planned' | 'booked' | 'in_progress' | 'completed';
}

interface MultiModalJourney {
    id: string;
    segments: JourneySegment[];
    totalPrice: number;
    totalDuration: number;
    connections: number;
    status: 'planned' | 'booked' | 'in_progress' | 'completed';
}

export const MultiModalTransport: React.FC = () => {
    const { user } = useAuth();
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [passengers, setPassengers] = useState(1);
    const [journeys, setJourneys] = useState<MultiModalJourney[]>([]);
    const [selectedJourney, setSelectedJourney] = useState<MultiModalJourney | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    const transportModes: TransportMode[] = [
        {
            id: 'flight',
            name: 'Flight',
            type: 'flight',
            icon: Plane,
            color: 'text-blue-600',
            providers: ['Emirates', 'Etihad', 'Flydubai']
        },
        {
            id: 'train',
            name: 'Train',
            type: 'train',
            icon: Train,
            color: 'text-green-600',
            providers: ['UAE Rail', 'Saudi Rail']
        },
        {
            id: 'bus',
            name: 'Bus',
            type: 'bus',
            icon: Bus,
            color: 'text-orange-600',
            providers: ['Dubai Bus', 'EWA Bus', 'Careem Bus']
        },
        {
            id: 'car',
            name: 'Ride Share',
            type: 'car',
            icon: Car,
            color: 'text-purple-600',
            providers: ['Wassel', 'Careem', 'Uber']
        }
    ];

    const searchMultiModalJourneys = async () => {
        if (!fromLocation || !toLocation || !departureDate) return;

        setIsSearching(true);
        try {
            // Mock multimodal journey search
            const mockJourneys: MultiModalJourney[] = [
                {
                    id: 'journey-1',
                    segments: [
                        {
                            id: 'seg-1',
                            mode: transportModes[3], // Car
                            from: fromLocation,
                            to: 'Dubai Airport',
                            departureTime: `${departureDate}T08:00:00`,
                            arrivalTime: `${departureDate}T09:30:00`,
                            duration: 90,
                            price: 45,
                            currency: 'AED',
                            provider: 'Wassel',
                            status: 'planned'
                        },
                        {
                            id: 'seg-2',
                            mode: transportModes[0], // Flight
                            from: 'Dubai Airport',
                            to: 'Jeddah Airport',
                            departureTime: `${departureDate}T11:00:00`,
                            arrivalTime: `${departureDate}T13:30:00`,
                            duration: 150,
                            price: 850,
                            currency: 'AED',
                            provider: 'Emirates',
                            status: 'planned'
                        },
                        {
                            id: 'seg-3',
                            mode: transportModes[2], // Bus
                            from: 'Jeddah Airport',
                            to: toLocation,
                            departureTime: `${departureDate}T15:00:00`,
                            arrivalTime: `${departureDate}T17:30:00`,
                            duration: 150,
                            price: 35,
                            currency: 'AED',
                            provider: 'Saptco',
                            status: 'planned'
                        }
                    ],
                    totalPrice: 930,
                    totalDuration: 390,
                    connections: 2,
                    status: 'planned'
                },
                {
                    id: 'journey-2',
                    segments: [
                        {
                            id: 'seg-4',
                            mode: transportModes[1], // Train
                            from: fromLocation,
                            to: 'Riyadh Central',
                            departureTime: `${departureDate}T06:00:00`,
                            arrivalTime: `${departureDate}T12:00:00`,
                            duration: 360,
                            price: 120,
                            currency: 'AED',
                            provider: 'Saudi Rail',
                            status: 'planned'
                        },
                        {
                            id: 'seg-5',
                            mode: transportModes[2], // Bus
                            from: 'Riyadh Central',
                            to: toLocation,
                            departureTime: `${departureDate}T14:00:00`,
                            arrivalTime: `${departureDate}T18:00:00`,
                            duration: 240,
                            price: 55,
                            currency: 'AED',
                            provider: 'Saudi Bus',
                            status: 'planned'
                        }
                    ],
                    totalPrice: 175,
                    totalDuration: 600,
                    connections: 1,
                    status: 'planned'
                }
            ];

            setJourneys(mockJourneys);
        } catch (error) {
            console.error('Error searching journeys:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const bookMultiModalJourney = async (journey: MultiModalJourney) => {
        setIsBooking(true);
        try {
            // Mock booking process for all segments
            const bookingPromises = journey.segments.map(async (segment) => {
                // Simulate API call to each transport provider
                await new Promise(resolve => setTimeout(resolve, 1000));

                return {
                    ...segment,
                    bookingRef: `BK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    status: 'booked' as const
                };
            });

            const bookedSegments = await Promise.all(bookingPromises);

            const bookedJourney = {
                ...journey,
                segments: bookedSegments,
                status: 'booked' as const
            };

            setSelectedJourney(bookedJourney);
            alert('Multi-modal journey booked successfully!');
        } catch (error) {
            console.error('Error booking journey:', error);
            alert('Booking failed. Please try again.');
        } finally {
            setIsBooking(false);
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <Shuffle className="h-8 w-8 text-blue-600" />
                    <h1 className="text-3xl font-bold">Multi-Modal Transport</h1>
                </div>
                <p className="text-muted-foreground">
                    Plan and book complete journeys combining flights, trains, buses, and rides
                </p>
            </div>

            {/* Search Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Plan Your Journey</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">From</label>
                            <Input
                                placeholder="Departure city"
                                value={fromLocation}
                                onChange={(e) => setFromLocation(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">To</label>
                            <Input
                                placeholder="Destination city"
                                value={toLocation}
                                onChange={(e) => setToLocation(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Date</label>
                            <Input
                                type="date"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Passengers</label>
                            <Input
                                type="number"
                                min="1"
                                max="9"
                                value={passengers}
                                onChange={(e) => setPassengers(parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                    <Button
                        onClick={searchMultiModalJourneys}
                        disabled={isSearching || !fromLocation || !toLocation || !departureDate}
                        className="w-full md:w-auto"
                    >
                        {isSearching ? 'Searching...' : 'Search Multi-Modal Journeys'}
                    </Button>
                </CardContent>
            </Card>

            {/* Journey Results */}
            {journeys.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Available Journeys</h2>

                    {journeys.map((journey) => (
                        <Card key={journey.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {fromLocation} → {toLocation}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {journey.segments.length} segments • {journey.connections} connection{journey.connections !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">
                                            AED {journey.totalPrice}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {formatDuration(journey.totalDuration)}
                                        </div>
                                    </div>
                                </div>

                                {/* Journey Segments */}
                                <div className="space-y-3 mb-4">
                                    {journey.segments.map((segment, index) => {
                                        const Icon = segment.mode.icon;
                                        return (
                                            <div key={segment.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                                    <Icon className={`h-5 w-5 ${segment.mode.color}`} />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-medium truncate">
                                                            {segment.provider} {segment.mode.name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {segment.from} → {segment.to}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-sm text-center min-w-0">
                                                    <div className="font-medium">
                                                        {formatTime(segment.departureTime)}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {formatDuration(segment.duration)}
                                                    </div>
                                                </div>

                                                <div className="text-right min-w-0">
                                                    <div className="font-medium">
                                                        {segment.currency} {segment.price}
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {segment.status}
                                                    </Badge>
                                                </div>

                                                {index < journey.segments.length - 1 && (
                                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setSelectedJourney(journey)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        onClick={() => bookMultiModalJourney(journey)}
                                        disabled={isBooking}
                                        className="flex-1"
                                    >
                                        {isBooking ? 'Booking...' : `Book for AED ${journey.totalPrice}`}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Transport Modes Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Available Transport Modes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {transportModes.map((mode) => {
                            const Icon = mode.icon;
                            return (
                                <div key={mode.id} className="text-center p-4 border rounded-lg">
                                    <Icon className={`h-8 w-8 mx-auto mb-2 ${mode.color}`} />
                                    <h3 className="font-medium">{mode.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {mode.providers.length} providers
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
                <CardHeader>
                    <CardTitle>Why Multi-Modal Travel?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="font-medium">Cost Savings</div>
                                <div className="text-sm text-muted-foreground">
                                    Combine cheaper transport modes for significant savings
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="font-medium">Time Optimization</div>
                                <div className="text-sm text-muted-foreground">
                                    AI-optimized routing for fastest journey times
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="font-medium">Seamless Connections</div>
                                <div className="text-sm text-muted-foreground">
                                    Coordinated transfers and real-time updates
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                                <div className="font-medium">Single Booking</div>
                                <div className="text-sm text-muted-foreground">
                                    One payment and confirmation for entire journey
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MultiModalTransport;