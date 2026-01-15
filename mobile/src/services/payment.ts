
import { PlatformUtils } from '../utils';
import { Alert } from 'react-native';
import { initStripe, useStripe, presentPaymentSheet } from '@stripe/stripe-react-native';
import { supabase } from '../lib/supabase';

/**
 * Payment service for handling Stripe payments
 */
export class PaymentService {
    private static instance: PaymentService;
    private isInitialized = false;

    private constructor() { }

    static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    /**
     * Initialize Stripe
     */
    async initialize() {
        if (this.isInitialized) return;

        const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!publishableKey) {
            console.warn('Stripe publishable key not found');
            return;
        }

        try {
            await initStripe({
                publishableKey,
                merchantIdentifier: 'merchant.com.wasel.app',
                urlScheme: 'wasel',
            });
            this.isInitialized = true;
            console.log('Stripe initialized');
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
        }
    }

    /**
     * Check if the platform's native payment method is available
     * (Apple Pay / Google Pay via Stripe)
     */
    async isNativePaymentAvailable(): Promise<boolean> {
        // Stripe handles both Apple Pay and Google Pay
        // You would typically check this using confirmPlatformPay support
        // For now, we return true as Stripe handles device capability checks internally during payment flow
        return true;
    }

    /**
     * Get the name of the native payment method for the current platform
     */
    getNativePaymentMethodName(): string {
        return PlatformUtils.getPaymentMethodName();
    }

    /**
     * Process payment using Stripe Payment Sheet
     */
    async processPayment(
        amount: number,
        currency: string = 'USD', // defaults to USD if not provided
        description: string = 'Ride Payment'
    ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // 1. Fetch PaymentIntent client secret from Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('payment-sheet', {
                body: { amount, currency }
            });

            if (error) {
                console.error('Edge Function Error:', error);
                throw new Error('Failed to initialize payment');
            }

            const { paymentIntent, ephemeralKey, customer, publishableKey } = data;

            if (!paymentIntent) throw new Error('Could not retrieve payment intent');


            // 2. Initialize Payment Sheet
            const { error: initError } = await initPaymentSheet({
                merchantDisplayName: 'Wasel',
                customerId: customer,
                customerEphemeralKeySecret: ephemeralKey,
                paymentIntentClientSecret: paymentIntent,
                returnURL: 'wasel://stripe-redirect',
                allowsDelayedPaymentMethods: true,
                defaultBillingDetails: {
                    name: 'Wasel User',
                }
            });

            if (initError) {
                return { success: false, error: initError.message };
            }

            // 3. Present Payment Sheet
            const { error: paymentError } = await presentPaymentSheet();

            if (paymentError) {
                return { success: false, error: paymentError.message };
            }

            return {
                success: true,
                transactionId: paymentIntent.split('_secret')[0]
            };

        } catch (error) {
            console.error('Payment processing failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment failed'
            };
        }
    }

    /**
     * Format amount for display
     */
    formatAmount(amount: number, currency: string = 'USD'): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    }
}

export const paymentService = PaymentService.getInstance();