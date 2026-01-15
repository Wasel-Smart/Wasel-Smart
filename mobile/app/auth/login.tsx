import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../src/stores/authStore';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { biometricAuth } from '../../src/services';
import { PlatformUtils } from '../../src/utils';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const { signIn, loading } = useAuthStore();

    // Check biometric availability on component mount
    useEffect(() => {
        const checkBiometricStatus = async () => {
            try {
                const available = await biometricAuth.isBiometricAvailable();
                const enabled = await biometricAuth.isBiometricEnabled();
                setBiometricAvailable(available);
                setBiometricEnabled(enabled);
            } catch (error) {
                console.warn('Failed to check biometric status:', error);
            }
        };

        checkBiometricStatus();
    }, []);

    const handleBiometricLogin = async () => {
        try {
            const credentials = await biometricAuth.authenticateWithBiometric();
            if (credentials) {
                await signIn(credentials.email, credentials.password);
            }
        } catch (error: any) {
            Alert.alert('Biometric Login Failed', error.message || 'An error occurred during biometric authentication');
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            await signIn(email, password);
            // Navigation is handled by the protected layout
        } catch (error: any) {
            Alert.alert('Login Failed', error.message || 'An error occurred during login');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="name@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {biometricAvailable && biometricEnabled && (
                        <TouchableOpacity
                            style={styles.biometricButton}
                            onPress={handleBiometricLogin}
                            disabled={loading}
                        >
                            <Text style={styles.biometricButtonText}>
                                {PlatformUtils.getBiometricMethodName()}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <Link href="/auth/forgot-password" asChild>
                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Link href="/auth/signup" asChild>
                            <TouchableOpacity>
                                <Text style={styles.linkText}>Sign Up</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    linkText: {
        color: '#3b82f6',
        fontSize: 14,
        fontWeight: 'bold',
    },
    biometricButton: {
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    biometricButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
});
