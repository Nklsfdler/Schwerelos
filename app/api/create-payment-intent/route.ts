import { NextResponse } from "next/server";

export const runtime = "nodejs";

function generateOrderId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `SCH-${year}-${random}`;
}

function generateTrackingNumber(): string {
    const digits = Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join("");
    return `JD${digits}`;
}

export async function POST(request: Request) {
    try {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            console.error("STRIPE_SECRET_KEY is not set!");
            return NextResponse.json({ error: "Server-Konfigurationsfehler" }, { status: 500 });
        }

        // Create PaymentIntent — 0.50€ (50 cents) — LIVE mode
        const body = new URLSearchParams({
            amount: "50",
            currency: "eur",
            "automatic_payment_methods[enabled]": "true",
            "automatic_payment_methods[allow_redirects]": "always",
            description: "Schwerelos Edition 01 — Testbestellung",
            "metadata[order_id]": generateOrderId(),
            "metadata[tracking_nr]": generateTrackingNumber(),
            receipt_email: "", // Will be filled by Stripe from payment method
        });

        const stripeResponse = await fetch("https://api.stripe.com/v1/payment_intents", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });

        const data = await stripeResponse.json() as any;

        if (!stripeResponse.ok) {
            console.error("Stripe API error:", data?.error);
            return NextResponse.json(
                { error: data?.error?.message ?? "Stripe-Fehler" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            clientSecret: data.client_secret,
            orderId: data.metadata?.order_id ?? generateOrderId(),
            trackingNr: data.metadata?.tracking_nr ?? generateTrackingNumber(),
        });
    } catch (error: any) {
        console.error("API route error:", error?.message);
        return NextResponse.json(
            { error: `Serverfehler: ${error.message}` },
            { status: 500 }
        );
    }
}
