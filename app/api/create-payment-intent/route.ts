import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Generate order-related IDs
function generateOrderId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `SCH-${year}-${random}`;
}

function generateTrackingNumber(): string {
    // DHL-style: JD + 18 digits
    const digits = Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join("");
    return `JD${digits}`;
}

export async function POST(request: Request) {
    try {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            console.error("STRIPE_SECRET_KEY is not set!");
            return NextResponse.json({ error: "Server configuration error: Missing Stripe key" }, { status: 500 });
        }

        // Use native fetch — Stripe SDK has Node 24 compatibility issues on Vercel
        const body = new URLSearchParams({
            amount: "50", // €0.50 — Stripe minimum (real price 33.99€ shown in UI)
            currency: "eur",
            "automatic_payment_methods[enabled]": "true",
            "automatic_payment_methods[allow_redirects]": "always",
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
                { error: `Stripe Error: ${data?.error?.message ?? "Unknown error"}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            clientSecret: data.client_secret,
            orderId: generateOrderId(),
            trackingNr: generateTrackingNumber(),
        });
    } catch (error: any) {
        console.error("API route error:", error?.message);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
