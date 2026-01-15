import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Star, X } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

interface RateDriverProps {
    isVisible: boolean;
    onClose: () => void;
    tripId: string;
    driverId: string;
    driverName: string;
    onSuccess: () => void;
}

export function RateDriver({ isVisible, onClose, tripId, driverId, driverName, onSuccess }: RateDriverProps) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Error', 'Please select a rating');
            return;
        }

        setSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('ratings')
                .insert({
                    trip_id: tripId,
                    rater_id: user.id,
                    rated_user_id: driverId,
                    role: 'driver',
                    rating: rating,
                    comment: comment
                });

            if (error) throw error;

            Alert.alert('Success', 'Thank you for your feedback!');
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to submit rating');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Rate Your Trip</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>
                        How was your ride with {driverName}?
                    </Text>

                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                style={styles.starButton}
                            >
                                <Star
                                    size={40}
                                    color={star <= rating ? "#fbbf24" : "#e5e7eb"}
                                    fill={star <= rating ? "#fbbf24" : "none"}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Write a comment (optional)..."
                        multiline
                        numberOfLines={4}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        style={[styles.submitButton, submitting && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Rating</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        minHeight: 400,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 24,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 32,
    },
    starButton: {
        padding: 4,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        height: 120,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
