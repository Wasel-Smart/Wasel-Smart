import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { tripsAPI, bookingsAPI, MobileAPIError } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

interface TripItem {
    id: string;
    from: string;
    to: string;
    date: string;
    time: string;
    status: string;
    price: number;
    role: 'driver' | 'passenger';
    driverId?: string;
}

import { RateDriver } from './RateDriver';

export function MyTrips() {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [trips, setTrips] = useState<TripItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();
    const [ratingData, setRatingData] = useState<{ tripId: string, driverId: string, driverName: string } | null>(null);

    useEffect(() => {
        fetchTrips();
    }, [user]);

    const fetchTrips = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Fetch trips where user is driver
            const { trips: driverTrips } = await tripsAPI.getDriverTrips();

            // Fetch bookings where user is passenger
            const { bookings: passengerBookings } = await bookingsAPI.getUserBookings();

            // Transform and combine
            const transformedDriverTrips: TripItem[] = driverTrips.map((t: any) => ({
                id: t.id,
                from: t.from,
                to: t.to,
                date: t.departure_date,
                time: t.departure_time,
                status: t.status,
                price: t.price_per_seat * t.available_seats,
                role: 'driver',
                otherPartyName: 'You (Driver)'
            }));

            const transformedPassengerTrips: TripItem[] = passengerBookings.map((b: any) => ({
                id: b.id,
                from: b.trip?.from || 'Unknown',
                to: b.trip?.to || 'Unknown',
                date: b.trip?.departure_date || '',
                time: b.trip?.departure_time || '',
                status: b.status,
                price: b.total_price,
                role: 'passenger',
                otherPartyName: b.trip?.driver?.full_name || 'Unknown Driver',
                driverId: b.trip?.driver?.id
            }));

            const allTrips = [...transformedDriverTrips, ...transformedPassengerTrips];
            allTrips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setTrips(allTrips);
        } catch (error) {
            console.error('Failed to fetch trips:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTrips = trips.filter(trip => {
        const tripDate = new Date(trip.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (activeTab === 'upcoming') {
            return tripDate >= today || trip.status === 'active' || trip.status === 'pending';
        } else {
            return tripDate < today || trip.status === 'completed' || trip.status === 'cancelled';
        }
    });

    const renderTripItem = ({ item }: { item: TripItem }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[
                    styles.roleBadge,
                    { backgroundColor: item.role === 'driver' ? '#dbeafe' : '#f3e8ff' }
                ]}>
                    <Text style={[
                        styles.roleText,
                        { color: item.role === 'driver' ? '#1e40af' : '#7e22ce' }
                    ]}>
                        {item.role === 'driver' ? 'Driving' : 'Riding'}
                    </Text>
                </View>
                <Text style={[
                    styles.statusText,
                    { color: item.status === 'active' || item.status === 'pending' ? '#059669' : '#6b7280' }
                ]}>
                    {item.status.toUpperCase()}
                </Text>
            </View>

            <View style={styles.routeContainer}>
                <Text style={styles.cityText}>{item.from}</Text>
                <ChevronRight size={16} color="#9ca3af" />
                <Text style={styles.cityText}>{item.to}</Text>
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Calendar size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{item.date}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Clock size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{item.time}</Text>
                </View>
            </View>

            <View style={styles.footerRow}>
                <View style={styles.detailRow}>
                    <User size={14} color="#6b7280" />
                    <Text style={styles.detailText}>{item.otherPartyName}</Text>
                </View>

                {item.role === 'passenger' && item.status === 'completed' && item.driverId && (
                    <TouchableOpacity
                        style={styles.rateButton}
                        onPress={() => setRatingData({
                            tripId: item.id,
                            driverId: item.driverId!,
                            driverName: item.otherPartyName
                        })}
                    >
                        <Text style={styles.rateButtonText}>Rate Driver</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <RateDriver
                isVisible={!!ratingData}
                onClose={() => setRatingData(null)}
                tripId={ratingData?.tripId || ''}
                driverId={ratingData?.driverId || ''}
                driverName={ratingData?.driverName || ''}
                onSuccess={() => {
                    Alert.alert('Success', 'Rating submitted');
                    setRatingData(null);
                }}
            />
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
                    onPress={() => setActiveTab('upcoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'past' && styles.activeTab]}
                    onPress={() => setActiveTab('past')}
                >
                    <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>History</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : filteredTrips.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No {activeTab} trips found.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTrips}
                    renderItem={renderTripItem}
                    keyExtractor={item => `${item.id}-${item.role}`}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    tabs: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#3b82f6',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
    },
    activeTabText: {
        color: '#3b82f6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cityText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 12,
        color: '#6b7280',
        marginLeft: 4,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingTop: 12,
    },
    rateButton: {
        backgroundColor: '#f59e0b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    rateButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
