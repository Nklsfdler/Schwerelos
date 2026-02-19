import { NextResponse } from "next/server";

// Force Node.js runtime — required for fetch to work correctly
export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            console.error("STRIPE_SECRET_KEY is not set!");
            return NextResponse.json({ error: "Server configuration error: Missing Stripe key" }, { status: 500 });
        }

        // Use native fetch instead of Stripe SDK (SDK has Node 24 compatibility issues)
        const body = new URLSearchParams({
            amount: "50", // €0.50 — Stripe minimum
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
        });
    } catch (error: any) {
        console.error("API route error:", error?.message);
        return NextResponse.json(
            { error: `Internal Server Error: ${error.message}` },
            { status: 500 }
        );
    }
}
