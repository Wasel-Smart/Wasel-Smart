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
        const { payment_intent_id, amount } = await req.json();

        if (!payment_intent_id) {
            throw new Error("payment_intent_id is required");
        }

        const refundConfig: any = {
            payment_intent: payment_intent_id,
        };

        // If amount is provided, it's a partial refund
        if (amount) {
            refundConfig.amount = Math.round(amount * 100);
        }

        const refund = await stripe.refunds.create(refundConfig);

        return new Response(
            JSON.stringify({ refund }),
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
