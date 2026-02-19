"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
    ExpressCheckoutElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe once, outside of component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- OUTER WRAPPER: Loads PaymentIntent, then renders Stripe Elements ---
export default function StripeCheckout({ amount = 1 }: { amount?: number }) {
    const [clientSecret, setClientSecret] = useState<string>("");
    const [orderId, setOrderId] = useState<string>("");
    const [trackingNr, setTrackingNr] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setError(null);
        fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setClientSecret(data.clientSecret);
                    if (data.orderId) setOrderId(data.orderId);
                    if (data.trackingNr) setTrackingNr(data.trackingNr);
                }
            })
            .catch(() => setError("Verbindung zum Server fehlgeschlagen."));
    }, [amount]);

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                <p className="font-bold mb-1">Fehler beim Laden</p>
                <p className="text-xs opacity-70">{error}</p>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-12">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-white/30 text-xs uppercase tracking-widest">Verbinde mit Stripe...</p>
            </div>
        );
    }

    const appearance = {
        theme: "night" as const,
        variables: {
            colorPrimary: "#3b82f6",
            colorBackground: "#0a0a0c",
            colorText: "#ffffff",
            colorTextSecondary: "rgba(255,255,255,0.5)",
            colorTextPlaceholder: "rgba(255,255,255,0.3)",
            colorIconTab: "rgba(255,255,255,0.5)",
            colorIconTabSelected: "#ffffff",
            fontFamily: '"Outfit", sans-serif',
            spacingUnit: "4px",
            borderRadius: "12px",
            fontSizeBase: "15px",
        },
        rules: {
            ".Tab": {
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "none",
                backgroundColor: "rgba(255,255,255,0.02)",
            },
            ".Tab:hover": { backgroundColor: "rgba(255, 255, 255, 0.05)" },
            ".Tab--selected": {
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
            },
            ".Input": {
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
            },
            ".Input:focus": {
                border: "1px solid rgba(59,130,246,0.5)",
                boxShadow: "0 0 0 2px rgba(59,130,246,0.15)",
            },
            ".Label": { color: "rgba(255,255,255,0.5)" },
        },
    };

    const options = {
        clientSecret,
        appearance,
        locale: "de" as const,
        loader: "auto" as const,
    };

    return (
        <div className="w-full">
            <Elements options={options} stripe={stripePromise}>
                <CheckoutForm orderId={orderId} trackingNr={trackingNr} />
            </Elements>
        </div>
    );
}

// --- INNER FORM: Uses Stripe hooks ---
function CheckoutForm({ orderId = "", trackingNr = "" }: { orderId?: string; trackingNr?: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expressAvailable, setExpressAvailable] = useState(false);

    const getReturnUrl = () => {
        const base = `${window.location.origin}/bestellung-bestaetigung`;
        const params = new URLSearchParams();
        if (orderId) params.set("order_id", orderId);
        if (trackingNr) params.set("tracking", trackingNr);
        return `${base}?${params.toString()}`;
    };

    // Check for redirect-back success/failure
    useEffect(() => {
        if (!stripe) return;
        const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
        if (!clientSecret) return;
        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            if (paymentIntent?.status === "succeeded") setMessage("✓ Zahlung erfolgreich. Danke!");
            else if (paymentIntent?.status === "processing") setMessage("⏳ Zahlung wird verarbeitet...");
            else setMessage("⚠ Zahlung fehlgeschlagen.");
        });
    }, [stripe]);

    // Handle standard form submit (Card / SEPA / Klarna etc.)
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsLoading(true);
        setMessage(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: getReturnUrl(),
            },
        });

        if (error) {
            setMessage(error.message ?? "Ein unbekannter Fehler ist aufgetreten.");
        }
        setIsLoading(false);
    }, [stripe, elements, orderId, trackingNr]);

    // Handle Apple Pay / Google Pay confirmation
    const handleExpressConfirm = useCallback(async () => {
        if (!stripe || !elements) return;
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: getReturnUrl(),
            },
        });
        if (error) {
            setMessage(error.message ?? "Express-Zahlung fehlgeschlagen.");
        }
    }, [stripe, elements, orderId, trackingNr]);

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* EXPRESS CHECKOUT: Apple Pay / Google Pay only — Link deaktiviert */}
            <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
                    Apple Pay / Google Pay
                </p>
                <ExpressCheckoutElement
                    onConfirm={handleExpressConfirm}
                    onReady={({ availablePaymentMethods }) => {
                        if (availablePaymentMethods) setExpressAvailable(true);
                    }}
                    options={{
                        // Remove Link — only show wallet buttons (Apple Pay, Google Pay)
                        paymentMethods: {
                            link: "never",
                            applePay: "always",
                            googlePay: "always",
                            amazonPay: "never",
                            paypal: "never",
                        },
                        buttonType: { applePay: "buy", googlePay: "buy" },
                        buttonTheme: { applePay: "white", googlePay: "black" },
                        buttonHeight: 52,
                    }}
                />
                {!expressAvailable && (
                    <p className="text-[9px] text-white/20 mt-2 text-center">
                        Apple Pay: Safari + Karte in Wallet & Apple Pay erforderlich
                    </p>
                )}
            </div>

            {/* DIVIDER */}
            <div className="relative flex items-center gap-3">
                <div className="flex-grow border-t border-white/8" />
                <span className="text-[10px] text-white/25 uppercase tracking-widest shrink-0">Oder</span>
                <div className="flex-grow border-t border-white/8" />
            </div>

            {/* STANDARD PAYMENT ELEMENT — Link ausgeblendet */}
            <PaymentElement
                options={{
                    layout: "tabs",
                    wallets: { applePay: "never", googlePay: "never" },
                }}
            />

            <button
                type="submit"
                disabled={isLoading || !stripe || !elements}
                className="w-full py-4 bg-white text-black font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.08)] mt-2"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Verarbeiten...
                    </span>
                ) : "Jetzt zahlen — 33,99 €"}
            </button>

            {message && (
                <div className="text-center text-sm mt-2 p-3 rounded-xl border border-white/10 text-white/60">
                    {message}
                </div>
            )}
        </form>
    );
}
