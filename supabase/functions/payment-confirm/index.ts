import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
});

interface ConfirmPaymentRequest {
  paymentIntentId: string;
  tripId: string;
  userId: string;
}

serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body: ConfirmPaymentRequest = await req.json();
    const { paymentIntentId, tripId, userId } = body;

    if (!paymentIntentId || !tripId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Retrieve payment intent to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Payment already confirmed - return success
      return new Response(
        JSON.stringify({
          success: true,
          paymentId: paymentIntentId,
          status: 'already_confirmed',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (paymentIntent.status === 'canceled') {
      return new Response(
        JSON.stringify({
          error: 'Payment was canceled',
          status: 'canceled',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Return payment intent details for frontend confirmation
    return new Response(
      JSON.stringify({
        success: true,
        paymentId: paymentIntentId,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        requiresAction: paymentIntent.status === 'requires_action',
        clientSecret: paymentIntent.client_secret,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Payment confirm error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to confirm payment',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

console.log('Payment Confirm function initialized');
