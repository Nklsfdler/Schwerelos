import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-01-28.clover",
});

export async function POST(request: Request) {
    try {
        const { amount } = await request.json();

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 50, // Stripe minimum is €0.50 (50 cents)
            currency: "eur",
            // STRICT: Card (Apple Pay) + Klarna + PayPal + SEPA
            payment_method_types: ['card', 'klarna', 'paypal', 'sepa_debit'],
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        console.error("Internal Error:", error);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
