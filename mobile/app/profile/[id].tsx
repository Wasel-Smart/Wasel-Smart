import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { MessageCircle, Star, Phone, Shield } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function PublicProfile() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to load profile');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleMessage = () => {
        if (!profile) return;
        router.push(`/messages/${profile.id}`);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!profile) return null;

    return (
        <ScrollView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    {profile.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarText}>{profile.full_name?.charAt(0)}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.name}>{profile.full_name}</Text>

                <View style={styles.ratingRow}>
                    <Star size={18} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.ratingText}>
                        {profile.rating_as_driver ? profile.rating_as_driver.toFixed(1) : 'New'}
                    </Text>
                    <Text style={styles.roleText}>• Driver</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{profile.trips_completed || 0}</Text>
                    <Text style={styles.statLabel}>Trips</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{profile.total_ratings_received || 0}</Text>
                    <Text style={styles.statLabel}>Reviews</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                        {new Date(profile.created_at).getFullYear()}
                    </Text>
                    <Text style={styles.statLabel}>Joined</Text>
                </View>
            </View>

            <View style={styles.content}>

                <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                    <MessageCircle color="white" size={20} />
                    <Text style={styles.messageButtonText}>Send Message</Text>
                </TouchableOpacity>

                {profile.bio && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About</Text>
                        <Text style={styles.bioText}>{profile.bio}</Text>
                    </View>
                )}

                <View style={styles.verificationSection}>
                    <View style={styles.verificationItem}>
                        <Shield size={20} color={profile.is_verified ? "#059669" : "#9ca3af"} />
                        <Text style={styles.verificationText}>
                            {profile.is_verified ? 'Identity Verified' : 'Identity Unverified'}
                        </Text>
                    </View>
                    <View style={styles.verificationItem}>
                        <Phone size={20} color={profile.phone_verified ? "#059669" : "#9ca3af"} />
                        <Text style={styles.verificationText}>
                            {profile.phone_verified ? 'Phone Verified' : 'Phone Unverified'}
                        </Text>
                    </View>
                </View>

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
    header: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#f9fafb',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    roleText: {
        fontSize: 16,
        color: '#6b7280',
    },
    statsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        paddingVertical: 16,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    statLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        padding: 24,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
        gap: 8,
    },
    messageButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    bioText: {
        fontSize: 16,
        color: '#4b5563',
        lineHeight: 24,
    },
    verificationSection: {
        gap: 16,
    },
    verificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    verificationText: {
        fontSize: 16,
        color: '#374151',
    },
});
