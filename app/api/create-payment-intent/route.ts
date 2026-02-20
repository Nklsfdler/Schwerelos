import { NextResponse } from "next/server";

export const runtime = "nodejs";

function generateOrderId(): string {
    return `SCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`;
}

function generateTrackingNumber(): string {
    return `JD${Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join("")}`;
}

export async function POST(request: Request) {
    try {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            console.error("STRIPE_SECRET_KEY is not set!");
            return NextResponse.json({ error: "Server: Missing Stripe key" }, { status: 500 });
        }

        const body = new URLSearchParams({
            amount: "50",           // €0.50 (demo amount, real price 33.99€ shown in UI)
            currency: "eur",
            description: "Schwerelos Edition 01 — Demo-Bestellung",
            "automatic_payment_methods[enabled]": "true",
            "automatic_payment_methods[allow_redirects]": "always",
            // Enable email receipt to customer
            receipt_email: "",      // Will be filled from payment form if customer provides email
            "metadata[product]": "Schwerelos Edition 01",
            "metadata[display_price]": "33.99",
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
                { error: `Stripe: ${data?.error?.message ?? "Unknown error"}` },
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
            { error: `Internal: ${error.message}` },
            { status: 500 }
        );
    }
}
