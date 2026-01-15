import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { tripsAPI, bookingsAPI, MobileAPIError } from '../../src/services/api';
import { useAuthStore } from '../../src/stores/authStore';
import { MapPin, Calendar, Clock, User, Phone, Shield, AlertTriangle, MessageCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function TripDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        fetchTripDetails();
    }, [id]);

    const fetchTripDetails = async () => {
        try {
            const { trip } = await tripsAPI.getTripById(id as string);
            setTrip(trip);
        } catch (error) {
            Alert.alert('Error', 'Failed to load trip details');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleBookRide = async () => {
        if (!trip) return;
        setBookingLoading(true);
        try {
            await bookingsAPI.createBooking(trip.id, 1, trip.from, trip.to);
            Alert.alert('Success', 'Ride booked successfully!', [
                { text: 'OK', onPress: () => router.push('/(tabs)/trips') }
            ]);
        } catch (error: any) {
            Alert.alert('Booking Failed', error.message || 'Could not book this ride');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleContactDriver = () => {
        if (!trip?.driver?.id) return;
        router.push(`/messages/${trip.driver.id}`);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!trip) return null;

    const isDriver = user?.id === trip.driver_id;

    return (
        <ScrollView style={styles.container}>
            <StatusBar style="dark" />

            {/* Map Placeholder */}
            <View style={styles.mapPlaceholder}>
                <MapPin size={48} color="#9ca3af" />
                <Text style={styles.mapText}>Route Map View</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.price}>${trip.price_per_seat}</Text>
                    <Text style={styles.perSeat}>per seat</Text>
                </View>

                {/* Route Info */}
                <View style={styles.section}>
                    <View style={styles.timelineItem}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineContent}>
                            <Text style={styles.time}>{trip.departure_time}</Text>
                            <Text style={styles.location}>{trip.from}</Text>
                        </View>
                    </View>
                    <View style={styles.timelineConnector} />
                    <View style={styles.timelineItem}>
                        <View style={[styles.timelineDot, styles.timelineDotDest]} />
                        <View style={styles.timelineContent}>
                            <Text style={styles.time}>--:--</Text>
                            <Text style={styles.location}>{trip.to}</Text>
                        </View>
                    </View>
                </View>

                {/* Date */}
                <View style={styles.infoRow}>
                    <Calendar size={20} color="#6b7280" />
                    <Text style={styles.infoText}>{trip.departure_date}</Text>
                </View>

                {/* Driver Info */}
                <View style={styles.driverSection}>
                    <TouchableOpacity
                        style={styles.driverHeader}
                        onPress={() => router.push(`/profile/${trip.driver?.id}`)}
                    >
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{trip.driver?.full_name?.charAt(0)}</Text>
                        </View>
                        <View style={styles.driverInfo}>
                            <Text style={styles.driverName}>{trip.driver?.full_name}</Text>
                            <View style={styles.ratingContainer}>
                                <Text style={styles.rating}>★ {trip.driver?.rating || 'New'}</Text>
                                <Text style={styles.tripsCount}>• {trip.driver?.trips_completed || 0} trips</Text>
                            </View>
                        </View>
                        {!isDriver && (
                            <TouchableOpacity style={styles.messageButton} onPress={handleContactDriver}>
                                <MessageCircle size={20} color="#3b82f6" />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Vehicle Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle</Text>
                    <Text style={styles.vehicleText}>{trip.vehicle_type || 'Sedan'} • {trip.vehicle_color || 'White'}</Text>
                </View>

                {/* Safety */}
                <View style={styles.safetySection}>
                    <Shield size={20} color="#059669" />
                    <View style={styles.safetyContent}>
                        <Text style={styles.safetyTitle}>Verified Driver</Text>
                        <Text style={styles.safetyDesc}>Identity and vehicle documents verified</Text>
                    </View>
                </View>

                {/* Action Button */}
                {!isDriver && (
                    <TouchableOpacity
                        style={[styles.bookButton, (bookingLoading || trip.available_seats === 0) && styles.disabledButton]}
                        onPress={handleBookRide}
                        disabled={bookingLoading || trip.available_seats === 0}
                    >
                        <Text style={styles.bookButtonText}>
                            {bookingLoading ? 'Booking...' : trip.available_seats === 0 ? 'Fully Booked' : 'Book This Ride'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapPlaceholder: {
        height: 200,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapText: {
        marginTop: 8,
        color: '#9ca3af',
    },
    content: {
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -20,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    price: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    perSeat: {
        fontSize: 16,
        color: '#6b7280',
        marginLeft: 8,
    },
    section: {
        marginBottom: 24,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#3b82f6',
        marginTop: 6,
        zIndex: 1,
    },
    timelineDotDest: {
        borderColor: '#10b981',
    },
    timelineConnector: {
        width: 2,
        height: 40,
        backgroundColor: '#e5e7eb',
        marginLeft: 5,
        marginVertical: -2,
    },
    timelineContent: {
        marginLeft: 16,
        flex: 1,
    },
    time: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    location: {
        fontSize: 16,
        color: '#4b5563',
        marginTop: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#374151',
    },
    driverSection: {
        marginBottom: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingBottom: 24,
    },
    driverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    driverInfo: {
        flex: 1,
        marginLeft: 16,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    tripsCount: {
        fontSize: 14,
        color: '#6b7280',
        marginLeft: 8,
    },
    messageButton: {
        padding: 12,
        backgroundColor: '#eff6ff',
        borderRadius: 50,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    vehicleText: {
        fontSize: 16,
        color: '#4b5563',
    },
    safetySection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ecfdf5',
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
    },
    safetyContent: {
        marginLeft: 12,
        flex: 1,
    },
    safetyTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#065f46',
    },
    safetyDesc: {
        fontSize: 12,
        color: '#047857',
    },
    bookButton: {
        backgroundColor: '#3b82f6',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
    },
    bookButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
