import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
    try {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            console.error("STRIPE_SECRET_KEY is not set!");
            return NextResponse.json({ error: "Server configuration error: Missing Stripe key" }, { status: 500 });
        }

        // Initialize inside handler so env vars are fully available
        const stripe = new Stripe(key, {
            apiVersion: "2026-01-28.clover",
        });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: 50, // Stripe minimum: €0.50
            currency: "eur",
            // Card includes Apple Pay. Klarna and SEPA are separate.
            payment_method_types: ["card", "klarna", "sepa_debit"],
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
