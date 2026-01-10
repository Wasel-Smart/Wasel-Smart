import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
});

interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  userId: string;
  tripId?: string;
  metadata?: Record<string, string>;
}

serve(async (req) => {
  try {
    // Verify request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: CreatePaymentIntentRequest = await req.json();
    const { amount, currency = 'usd', userId, tripId, metadata } = body;

    // Validate required fields
    if (!amount || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: amount, userId' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId,
        tripId: tripId || '',
        source: 'wassel-app',
        ...metadata,
      },
      description: tripId ? `Wassel Trip: ${tripId}` : 'Wassel Payment',
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create payment intent',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

console.log('Payment Create Intent function initialized');
