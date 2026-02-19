import { NextResponse } from "next/server";
import Stripe from "stripe";

// Force Node.js runtime — Stripe SDK requires real Node.js HTTP (not Edge)
export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            console.error("STRIPE_SECRET_KEY is not set!");
            return NextResponse.json({ error: "Server configuration error: Missing Stripe key" }, { status: 500 });
        }

        const stripe = new Stripe(key, {
            apiVersion: "2026-01-28.clover",
        });

        // Use automatic payment methods — lets Stripe decide based on account capabilities.
        // This avoids errors from specifying payment types not enabled on this account.
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 50, // Stripe minimum: €0.50
            currency: "eur",
            automatic_payment_methods: {
                enabled: true,
                // Allow redirect-based methods (needed for Klarna)
                allow_redirects: "always",
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error("Stripe PaymentIntent error:", error?.message, error?.type, error?.code);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
