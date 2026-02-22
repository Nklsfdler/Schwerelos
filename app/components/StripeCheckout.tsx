"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Elements,
    PaymentElement,
    ExpressCheckoutElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { motion } from "framer-motion";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

/* ─── OUTER WRAPPER ─── */
export default function StripeCheckout({ amount = 50 }: { amount?: number }) {
    const [clientSecret, setClientSecret] = useState<string>("");
    const [paymentIntentId, setPaymentIntentId] = useState<string>("");
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
                if (data.error) setError(data.error);
                else {
                    setClientSecret(data.clientSecret);
                    if (data.paymentIntentId) setPaymentIntentId(data.paymentIntentId);
                    if (data.orderId) setOrderId(data.orderId);
                    if (data.trackingNr) setTrackingNr(data.trackingNr);
                }
            })
            .catch(() => setError("Verbindung fehlgeschlagen."));
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
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "none",
                backgroundColor: "rgba(255,255,255,0.02)",
            },
            ".Tab:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
            ".Tab--selected": {
                backgroundColor: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.3)",
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

    return (
        <div className="w-full">
            <Elements
                options={{ clientSecret, appearance, locale: "de" as const, loader: "auto" as const }}
                stripe={stripePromise}
            >
                <CheckoutForm orderId={orderId} trackingNr={trackingNr} paymentIntentId={paymentIntentId} />
            </Elements>
        </div>
    );
}

/* ─── INNER CHECKOUT FORM ─── */
function CheckoutForm({ orderId = "", trackingNr = "", paymentIntentId = "" }: { orderId?: string; trackingNr?: string; paymentIntentId?: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    // Initialize email from sessionStorage
    useEffect(() => {
        setIsMounted(true);
        const storedEmail = sessionStorage.getItem("checkoutEmail");
        if (storedEmail) setEmail(storedEmail);
    }, []);

    // Save email to sessionStorage
    useEffect(() => {
        if (!isMounted) return;
        sessionStorage.setItem("checkoutEmail", email);
    }, [email, isMounted]);

    const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    // Update receipt_email on Stripe when email changes
    const updateReceiptEmail = useCallback(async (emailValue: string) => {
        if (!paymentIntentId || !validateEmail(emailValue)) return;
        try {
            await fetch("/api/update-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentIntentId, email: emailValue }),
            });
        } catch { /* silent */ }
    }, [paymentIntentId]);

    const getReturnUrl = useCallback(() => {
        const base = `${window.location.origin}/bestellung-bestaetigung`;
        const params = new URLSearchParams();
        if (orderId) params.set("order_id", orderId);
        if (trackingNr) params.set("tracking", trackingNr);
        if (paymentIntentId) params.set("pi", paymentIntentId);
        return `${base}?${params.toString()}`;
    }, [orderId, trackingNr, paymentIntentId]);

    useEffect(() => {
        if (!stripe) return;
        const cs = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
        if (!cs) return;

        stripe.retrievePaymentIntent(cs).then(({ paymentIntent }) => {
            if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
                setMessage("✓ Zahlung erfolgreich! Weiterleitung...");
                sessionStorage.removeItem("cartOpen");
                sessionStorage.removeItem("checkoutOpen");
                // Immediately redirect to avoid PayPal showing the main payment form
                window.location.href = getReturnUrl();
            } else {
                setMessage("⚠ Zahlung fehlgeschlagen.");
            }
        });
    }, [stripe, getReturnUrl]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        if (!validateEmail(email)) {
            setEmailError("Bitte gib eine gültige E-Mail-Adresse ein.");
            return;
        }
        setEmailError("");
        setIsLoading(true);
        setMessage(null);

        await updateReceiptEmail(email);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: getReturnUrl(),
                payment_method_data: {
                    billing_details: { email },
                },
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message ?? "Ein Fehler ist aufgetreten.");
            setIsLoading(false);
        } else if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
            // Payment succeeded or is processing without a top-level redirect (e.g. Popup flow)
            sessionStorage.removeItem("cartOpen");
            sessionStorage.removeItem("checkoutOpen");
            window.location.href = getReturnUrl();
        } else {
            // Fallback for unexpected status
            window.location.href = getReturnUrl();
        }
    }, [stripe, elements, email, getReturnUrl, updateReceiptEmail]);

    const handleExpressConfirm = useCallback(async () => {
        if (!stripe || !elements) return;

        // E-Mail is REQUIRED for ALL payment methods
        if (!validateEmail(email)) {
            setEmailError("Bitte gib zuerst eine gültige E-Mail-Adresse ein.");
            setMessage("⚠ E-Mail-Adresse erforderlich, auch für Express-Zahlungen.");
            return;
        }

        setEmailError("");
        await updateReceiptEmail(email);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: getReturnUrl(),
                payment_method_data: {
                    billing_details: { email },
                },
            },
            redirect: "if_required",
        });

        if (error) {
            // If the user aborts PayPal or Apple Pay, Stripe returns an error.
            if (error.type === "validation_error") {
                // Ignore standard form validation errors when using the express button
                return;
            }
            setMessage(error.message ?? "Express-Zahlung fehlgeschlagen.");
        } else if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
            sessionStorage.removeItem("cartOpen");
            sessionStorage.removeItem("checkoutOpen");
            window.location.href = getReturnUrl();
        } else {
            window.location.href = getReturnUrl();
        }
    }, [stripe, elements, email, getReturnUrl, updateReceiptEmail]); const [confirmedDemo, setConfirmedDemo] = useState(false);

    return (
        <form onSubmit={handleSubmit} className="space-y-5 relative">
            {/* ─── DEMO MODE GATE ─── */}
            {!confirmedDemo && (
                <div className="absolute -top-[120px] left-0 right-0 bottom-0 z-[100] flex items-start justify-center p-4 pt-10">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-3xl" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative z-10 w-full bg-gradient-to-b from-blue-600 to-blue-800 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-blue-400/30 text-center"
                    >
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-[family-name:var(--font-outfit)] font-black text-white mb-2 uppercase tracking-tight">Wichtiger Hinweis</h3>
                        <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">
                            Dies ist ein <span className="text-white font-bold">Demo-Modus</span>.<br />
                            Es wird <span className="text-white font-bold text-lg">0,50 €</span> berechnet.<br />
                            <span className="opacity-75">Die Zahlung dient als Spende, es wird keine Ware versendet und der Betrag wird nicht zurückerstattet.</span>
                        </p>
                        <button
                            type="button"
                            onClick={() => setConfirmedDemo(true)}
                            className="w-full py-4 bg-white text-blue-700 font-black uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                        >
                            Verstanden & Fortfahren
                        </button>
                    </motion.div>
                </div>
            )}

            {/* ─── EMAIL FIELD (REQUIRED) - ALWAYS VISIBLE AFTER DEMO CONFIRM ─── */}
            <div className={`transition-all duration-700 ${!confirmedDemo ? 'blur-xl grayscale-[0.5] opacity-20 pointer-events-none scale-95' : 'blur-0 opacity-100'}`}>
                <div className="relative z-20">
                    <label className="block text-[10px] text-white/60 uppercase tracking-widest font-bold mb-2">
                        E-Mail-Adresse <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) setEmailError("");
                        }}
                        onBlur={() => {
                            if (email && !validateEmail(email)) {
                                setEmailError("Bitte gib eine gültige E-Mail-Adresse ein.");
                            } else {
                                setEmailError("");
                                updateReceiptEmail(email);
                            }
                        }}
                        placeholder="deine@email.de"
                        className={`w-full px-4 py-3 bg-white/[0.03] border rounded-xl text-white text-sm placeholder:text-white/25 outline-none transition-all font-[family-name:var(--font-dm)] ${emailError
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-white/20 focus:border-blue-500/50 focus:shadow-[0_0_0_2px_rgba(59,130,246,0.15)]"
                            }`}
                    />
                    {emailError ? (
                        <p className="text-red-400 text-[11px] mt-1.5 font-medium">{emailError}</p>
                    ) : (
                        <p className="text-[9px] text-white/40 mt-1.5 font-medium tracking-wide">Pflichtfeld · Für Bestellbestätigung & Tracking</p>
                    )}
                </div>
            </div>

            {/* ─── PAYMENT METHODS (EXPRESS, CARDS, KLARNA) - BLURRED UNTIL EMAIL IS VALID ─── */}
            <div className={`transition-all duration-500 relative ${(!validateEmail(email) || !confirmedDemo) ? 'blur-md opacity-40 grayscale-[0.5] pointer-events-none select-none scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}>

                {/* OVERLAY PROMPT WHEN EMAIL IS MISSING */}
                {(!validateEmail(email) && confirmedDemo) && (
                    <div className="absolute inset-x-0 top-12 z-50 flex items-center justify-center">
                        <div className="bg-[#050505]/90 backdrop-blur-xl border border-white/20 px-5 py-3 rounded-full shadow-2xl flex items-center gap-3">
                            <span className="text-[11px] text-white/90 uppercase tracking-widest font-black">↑ Bitte zuerst E-Mail eingeben</span>
                        </div>
                    </div>
                )}

                {/* ─── EXPRESS CHECKOUT: Branded native buttons (Grid Layout) ─── */}
                <div className="mt-6">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">
                        Schnell bezahlen
                    </p>
                    <div className="express-grid [&_.p-ExpressCheckoutElement]:!gap-2 [&_button]:!rounded-xl [&_iframe]:!rounded-xl">
                        <ExpressCheckoutElement
                            onConfirm={handleExpressConfirm}
                            options={{
                                paymentMethods: {
                                    link: "never",
                                    applePay: "always",
                                    googlePay: "always",
                                    paypal: "auto",
                                    amazonPay: "never",
                                },
                                buttonType: {
                                    applePay: "buy",
                                    googlePay: "buy",
                                    paypal: "buynow",
                                },
                                buttonTheme: {
                                    applePay: "white-outline",
                                    googlePay: "white",
                                    paypal: "gold",
                                },
                                buttonHeight: 52,
                            }}
                        />
                    </div>
                </div>

                {/* ─── DIVIDER ─── */}
                <div className="relative flex items-center gap-3 my-6">
                    <div className="flex-grow border-t border-white/8" />
                    <span className="text-[10px] text-white/25 uppercase tracking-widest shrink-0">Alle Zahlungsarten</span>
                    <div className="flex-grow border-t border-white/8" />
                </div>

                {/* ─── PAYMENT ELEMENT: ALL PAYMENT METHODS (Unified) ─── */}
                <div className="mt-2">
                    <PaymentElement
                        options={{
                            layout: {
                                type: "accordion",
                                defaultCollapsed: false,
                                radios: true,
                                spacedAccordionItems: true,
                            },
                            wallets: { applePay: "never", googlePay: "never" },
                            business: { name: "Schwerelos by NFD" },
                        }}
                    />
                </div>

                {/* ─── SUBMIT BUTTON ─── */}
                <button
                    type="submit"
                    disabled={isLoading || !stripe || !elements || !validateEmail(email)}
                    className="w-full py-4 bg-white text-black font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.08)] mt-6 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            Verarbeiten...
                        </span>
                    ) : "JETZT KAUFEN — 0,50 €"}
                </button>

                {/* ─── TRUST FOOTER ─── */}
                <div className="flex items-center justify-center gap-4 pt-4 mb-2">
                    <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-green-500/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        <span className="text-[9px] text-white/25">SSL verschlüsselt</span>
                    </div>
                    <span className="text-white/10">·</span>
                    <span className="text-[9px] text-white/25">Powered by Stripe</span>
                </div>
            </div>

            {message && (
                <div className={`text-center text-sm mt-2 p-3 rounded-xl border ${message.startsWith("✓") ? "border-green-500/20 text-green-400 bg-green-500/5" : "border-white/10 text-white/60"
                    }`}>
                    {message}
                </div>
            )}
        </form>
    );
}
