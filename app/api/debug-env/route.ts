import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
    const key = process.env.STRIPE_SECRET_KEY;
    return NextResponse.json({
        hasKey: !!key,
        keyPrefix: key ? key.substring(0, 12) + "..." : "MISSING",
        nodeVersion: process.version,
        runtime: "nodejs",
    });
}
