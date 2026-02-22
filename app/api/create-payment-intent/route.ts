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

        let email: string | undefined;
        try {
            const json = await request.json();
            email = json?.email;
        } catch {
            // No body or not JSON — that's ok
        }

        const orderId = generateOrderId();
        const trackingNr = generateTrackingNumber();

        // Create PaymentIntent — 0.50€ (50 cents) — LIVE mode
        const body = new URLSearchParams({
            amount: "50",
            currency: "eur",
            "automatic_payment_methods[enabled]": "true",
            "automatic_payment_methods[allow_redirects]": "always",
            description: `Bestellung ${orderId} — Schwerelos Edition 01`,
            "metadata[order_id]": orderId,
            "metadata[tracking_nr]": trackingNr,
        });

        // Set receipt_email if email is provided → Stripe sends automatic receipt
        if (email && email.includes("@")) {
            body.set("receipt_email", email);
        }

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
            paymentIntentId: data.id,
            orderId,
            trackingNr,
        });
    } catch (error: any) {
        console.error("API route error:", error?.message);
        return NextResponse.json(
            { error: `Serverfehler: ${error.message}` },
            { status: 500 }
        );
    }
}
