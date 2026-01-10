import { useState } from 'react';

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
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        amount,
        currency: 'AED',
        status: Math.random() > 0.1 ? 'succeeded' : 'failed'
      };

      if (paymentIntent.status === 'failed') {
        throw new Error('Payment failed. Please try again.');
      }

      return paymentIntent;
    } catch (err: any) {
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