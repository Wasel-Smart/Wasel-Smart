import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { amount, currency = 'aed', customerId } = await req.json();

        if (!amount) {
            throw new Error("Amount is required");
        }

        let customer = customerId;

        // If no customer ID provided, create one (simple version for MVP)
        // In production, you'd lookup/store this in your Supabase users table
        if (!customer) {
            const newCustomer = await stripe.customers.create();
            customer = newCustomer.id;
        }

        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer },
            { apiVersion: '2022-11-15' }
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents/fils
            currency: currency,
            customer: customer,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return new Response(
            JSON.stringify({
                paymentIntent: paymentIntent.client_secret,
                ephemeralKey: ephemeralKey.secret,
                customer: customer,
                publishableKey: Deno.env.get("STRIPE_PUBLISHABLE_KEY"),
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
