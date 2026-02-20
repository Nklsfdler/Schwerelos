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

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/* ─── OUTER WRAPPER ─── */
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
            .then((r) => r.json())
            .then((data) => {
                if (data.error) setError(data.error);
                else {
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
            <div className="flex flex-col items-center justify-center gap-3 py-20">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-white/30 text-xs uppercase tracking-widest">Lade Zahlungsarten...</p>
            </div>
        );
    }

    const appearance = {
        theme: "night" as const,
        variables: {
            colorPrimary: "#3b82f6",
            colorBackground: "#0f0f11",
            colorText: "#ffffff",
            colorTextSecondary: "rgba(255,255,255,0.5)",
            colorTextPlaceholder: "rgba(255,255,255,0.3)",
            colorIconTab: "rgba(255,255,255,0.5)",
            colorIconTabSelected: "#ffffff",
            fontFamily: '"Outfit", sans-serif',
            spacingUnit: "4px",
            borderRadius: "14px",
            fontSizeBase: "15px",
        },
        rules: {
            ".Tab": {
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "none",
                backgroundColor: "rgba(255,255,255,0.02)",
                transition: "all 0.2s ease",
            },
            ".Tab:hover": { backgroundColor: "rgba(255,255,255,0.06)" },
            ".Tab--selected": {
                backgroundColor: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.3)",
                boxShadow: "0 0 12px rgba(59,130,246,0.1)",
            },
            ".Input": {
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "all 0.2s ease",
            },
            ".Input:focus": {
                border: "1px solid rgba(59,130,246,0.5)",
                boxShadow: "0 0 0 3px rgba(59,130,246,0.1)",
            },
            ".Label": { color: "rgba(255,255,255,0.5)", fontSize: "13px" },
        },
    };

    return (
        <div className="w-full">
            <Elements options={{ clientSecret, appearance, locale: "de" as const }} stripe={stripePromise}>
                <CheckoutForm orderId={orderId} trackingNr={trackingNr} />
            </Elements>
        </div>
    );
}

/* ─── INNER FORM ─── */
function CheckoutForm({ orderId = "", trackingNr = "" }: { orderId?: string; trackingNr?: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasExpress, setHasExpress] = useState<boolean | null>(null);

    const getReturnUrl = useCallback(() => {
        const base = `${window.location.origin}/bestellung-bestaetigung`;
        const params = new URLSearchParams();
        if (orderId) params.set("order_id", orderId);
        if (trackingNr) params.set("tracking", trackingNr);
        return `${base}?${params.toString()}`;
    }, [orderId, trackingNr]);

    /* redirect-back handler */
    useEffect(() => {
        if (!stripe) return;
        const cs = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
        if (!cs) return;
        stripe.retrievePaymentIntent(cs).then(({ paymentIntent }) => {
            if (paymentIntent?.status === "succeeded") setMessage("✓ Zahlung erfolgreich!");
            else if (paymentIntent?.status === "processing") setMessage("⏳ Wird verarbeitet...");
            else setMessage("⚠ Zahlung fehlgeschlagen.");
        });
    }, [stripe]);

    /* form submit */
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsLoading(true);
        setMessage(null);
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: getReturnUrl() },
        });
        if (error) setMessage(error.message ?? "Ein Fehler ist aufgetreten.");
        setIsLoading(false);
    }, [stripe, elements, getReturnUrl]);

    /* express checkout confirm */
    const handleExpressConfirm = useCallback(async () => {
        if (!stripe || !elements) return;
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: getReturnUrl() },
        });
        if (error) setMessage(error.message ?? "Express-Zahlung fehlgeschlagen.");
    }, [stripe, elements, getReturnUrl]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── EXPRESS CHECKOUT (Apple Pay / Google Pay) ── */}
            <div>
                <p className="text-[10px] text-white/25 uppercase tracking-[0.2em] mb-3 font-[family-name:var(--font-outfit)] font-bold">
                    Schnell bezahlen
                </p>
                <ExpressCheckoutElement
                    onConfirm={handleExpressConfirm}
                    onReady={({ availablePaymentMethods }) => {
                        setHasExpress(!!availablePaymentMethods && Object.values(availablePaymentMethods).some(Boolean));
                    }}
                    options={{
                        paymentMethods: {
                            applePay: "always",
                            googlePay: "always",
                            link: "never",
                            amazonPay: "never",
                            paypal: "never",
                        },
                        buttonType: { applePay: "buy", googlePay: "buy" },
                        buttonTheme: { applePay: "white-outline", googlePay: "white" },
                        buttonHeight: 52,
                        layout: { maxColumns: 2, maxRows: 1 },
                    }}
                />
                {hasExpress === false && (
                    <div className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-[10px] text-white/20 text-center leading-relaxed">
                            Apple Pay benötigt Safari + eine hinterlegte Karte in Wallet & Apple Pay.
                            Google Pay benötigt Chrome + ein hinterlegtes Google-Konto.
                        </p>
                    </div>
                )}
            </div>

            {/* ── DIVIDER ── */}
            <div className="relative flex items-center gap-4">
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] shrink-0 font-[family-name:var(--font-outfit)]">oder</span>
                <div className="flex-grow h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* ── ALL PAYMENT METHODS (Card, SEPA, Klarna, PayPal, Amazon Pay, etc.) ── */}
            <div>
                <p className="text-[10px] text-white/25 uppercase tracking-[0.2em] mb-3 font-[family-name:var(--font-outfit)] font-bold">
                    Zahlungsart wählen
                </p>
                <PaymentElement
                    options={{
                        layout: {
                            type: "accordion",
                            defaultCollapsed: false,
                            radios: true,
                            spacedAccordionItems: true,
                        },
                        paymentMethodOrder: [
                            "apple_pay",
                            "klarna",
                            "paypal",
                            "amazon_pay",
                            "card",
                            "sepa_debit",
                            "bancontact",
                        ],
                        wallets: { applePay: "never", googlePay: "never" },
                        business: { name: "Schwerelos by NFD" },
                    }}
                />
            </div>

            {/* ── PAY BUTTON ── */}
            <button
                type="submit"
                disabled={isLoading || !stripe || !elements}
                className="w-full py-4 bg-white text-black font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(255,255,255,0.06)] mt-2 relative overflow-hidden group"
            >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            Wird verarbeitet...
                        </span>
                    ) : "Jetzt bezahlen — 33,99 €"}
                </span>
            </button>

            {/* ── STATUS MESSAGE ── */}
            {message && (
                <div className={`text-center text-sm mt-2 p-4 rounded-2xl border ${message.startsWith("✓")
                        ? "border-green-500/20 bg-green-500/5 text-green-400"
                        : message.startsWith("⏳")
                            ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-400"
                            : "border-red-500/20 bg-red-500/5 text-red-400"
                    }`}>
                    {message}
                </div>
            )}

            {/* ── PAYMENT METHOD ICONS ── */}
            <div className="flex items-center justify-center gap-4 pt-2 opacity-30">
                {/* Apple Pay */}
                <svg viewBox="0 0 24 24" className="h-5 w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.078 23.55c-.473-.316-.893-.703-1.244-1.15-.383-.463-.738-.95-1.064-1.454-.766-1.12-1.365-2.345-1.78-3.636-.5-1.502-.743-2.94-.743-4.347 0-1.57.34-2.94 1.002-4.09.49-.9 1.22-1.653 2.1-2.182.85-.53 1.84-.82 2.84-.84.35 0 .73.05 1.13.15.29.08.64.21 1.07.37.55.21.85.34.95.37.32.12.59.18.78.18.16 0 .39-.05.645-.13.145-.05.42-.14.81-.31.386-.14.692-.26.935-.35.37-.11.728-.21 1.05-.26.39-.06.777-.02 1.16.1.49.16.95.4 1.37.71-.29.18-.56.38-.81.6-.51.44-.94.98-1.26 1.6-.38.75-.57 1.6-.54 2.45.03.75.22 1.48.56 2.14.34.66.81 1.24 1.4 1.7.29.23.6.44.94.62-.24.68-.49 1.33-.76 1.96-.42 1-.91 1.96-1.43 2.89-.34.6-.74 1.18-1.19 1.73-.45.55-.99.95-1.59 1.18-.46.17-.96.2-1.5.12-.36-.06-.77-.19-1.23-.38-.36-.15-.67-.26-.93-.32-.26-.07-.55-.1-.87-.1-.29 0-.56.04-.82.13-.26.08-.57.2-.94.35-.49.2-.88.33-1.16.38-.4.08-.76.08-1.02-.01zm5.77-21.4c-.06.37-.19.72-.39 1.05-.19.33-.44.63-.74.89-.35.3-.76.52-1.21.66-.42.13-.88.2-1.35.2.01-.4.07-.79.17-1.17.1-.38.25-.73.46-1.05.21-.32.46-.6.75-.84.3-.24.65-.42 1.05-.55.37-.12.68-.18.98-.18.06.37.04.74-.06 1.1-.03.12-.08.28-.14.45-.04.13-.08.26-.12.39z" />
                </svg>
                {/* Klarna */}
                <svg viewBox="0 0 68 32" className="h-4 w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
                    <text x="0" y="24" fontFamily="Arial" fontSize="22" fontWeight="700" fill="white">klarna</text>
                </svg>
                {/* PayPal */}
                <svg viewBox="0 0 24 24" className="h-5 w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c1.27 3.94-1.104 6.52-5.58 6.52H13.37c-.524 0-.968.382-1.05.9l-1.36 8.63a.516.516 0 0 0 .51.596h3.58c.457 0 .847-.334.918-.788l.038-.198.726-4.606.047-.254c.07-.454.46-.788.917-.788h.578c3.744 0 6.675-1.521 7.53-5.922.357-1.837.172-3.37-.726-4.449z" />
                </svg>
                {/* Visa */}
                <svg viewBox="0 0 38 24" className="h-4 w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
                    <rect width="38" height="24" rx="3" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                    <text x="19" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white" fontFamily="Arial">VISA</text>
                </svg>
                {/* Mastercard */}
                <svg viewBox="0 0 38 24" className="h-4 w-auto" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="12" r="7" fill="rgba(255,255,255,0.4)" />
                    <circle cx="24" cy="12" r="7" fill="rgba(255,255,255,0.25)" />
                </svg>
            </div>
        </form>
    );
}
