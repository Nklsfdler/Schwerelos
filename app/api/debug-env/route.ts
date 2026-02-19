import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
    try {
        const key = process.env.STRIPE_SECRET_KEY!;

        // Test direct HTTPS to Stripe (no SDK)
        const body = new URLSearchParams({
            amount: "50",
            currency: "eur",
            "automatic_payment_methods[enabled]": "true",
        });

        const response = await fetch("https://api.stripe.com/v1/payment_intents", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
        });

        const data = await response.json();

        if (response.ok) {
            return NextResponse.json({ success: true, id: data.id, status: response.status });
        } else {
            return NextResponse.json({ success: false, error: data.error, status: response.status });
        }
    } catch (err: any) {
        return NextResponse.json({ fetchError: err.message, type: err.constructor.name });
    }
}
