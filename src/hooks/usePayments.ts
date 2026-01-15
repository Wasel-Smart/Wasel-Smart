import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'cash';
  name: string;
  details: string;
  isDefault: boolean;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
}

export function usePayments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      name: 'Visa ending in 4242',
      details: '**** **** **** 4242',
      isDefault: true
    },
    {
      id: '2',
      type: 'wallet',
      name: 'Wassel Wallet',
      details: 'Balance: $150.00',
      isDefault: false
    },
    {
      id: '3',
      type: 'cash',
      name: 'Cash Payment',
      details: 'Pay driver directly',
      isDefault: false
    }
  ];

  const processPayment = async (amount: number, paymentMethodId: string): Promise<PaymentIntent> => {
    setLoading(true);
    setError(null);

    try {
      // 1. Call Supabase Edge Function to get PaymentIntent client secret
      const { data, error: functionError } = await supabase.functions.invoke('payment-sheet', {
        body: { amount, currency: 'AED', paymentMethodId }
      });

      if (functionError) throw new Error(functionError.message);
      if (!data?.paymentIntent) throw new Error('Failed to create payment intent');

      // 2. Here we would typically Confirm the payment using Stripe.js (Web)
      // Since this hook abstracts it, we'll return the Intent details for the UI to confirm
      // OR you can use useStripe() hook inside your component to validte.

      // For this implementation, we return the client_secret as the ID, so the UI knows it's ready
      // The actual confirmation (stripe.confirmCardPayment) typically happens in the UI component 
      // or we import loadStripe here.

      const paymentIntent: PaymentIntent = {
        id: data.paymentIntent, // This is client_secret
        amount,
        currency: 'AED',
        status: 'pending' // UI must confirm it
      };

      return paymentIntent;
    } catch (err: any) {
      console.error('Payment Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addPaymentMethod = async (cardData: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  }) => {
    setLoading(true);
    try {
      // Simulate adding payment method
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newMethod: PaymentMethod = {
        id: Date.now().toString(),
        type: 'card',
        name: `${cardData.name} ending in ${cardData.number.slice(-4)}`,
        details: `**** **** **** ${cardData.number.slice(-4)}`,
        isDefault: false
      };

      return newMethod;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refundPayment = async (paymentIntentId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { id: `re_${Date.now()}`, status: 'succeeded' };
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    paymentMethods: mockPaymentMethods,
    loading,
    error,
    processPayment,
    addPaymentMethod,
    refundPayment
  };
}