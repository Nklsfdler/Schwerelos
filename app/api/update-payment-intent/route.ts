import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            return NextResponse.json({ error: "Server-Konfigurationsfehler" }, { status: 500 });
        }

        const { paymentIntentId, email } = await request.json();

        if (!paymentIntentId || !email) {
            return NextResponse.json({ error: "paymentIntentId und email erforderlich" }, { status: 400 });
        }

        // Update PaymentIntent with receipt_email
        const body = new URLSearchParams({
            receipt_email: email,
        });

        const stripeResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });

        const data = await stripeResponse.json() as any;

        if (!stripeResponse.ok) {
            console.error("Stripe update error:", data?.error);
            return NextResponse.json(
                { error: data?.error?.message ?? "Stripe-Fehler" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Update PI error:", error?.message);
        return NextResponse.json(
            { error: `Serverfehler: ${error.message}` },
            { status: 500 }
        );
    }
}
