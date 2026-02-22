"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
    ExpressCheckoutElement,
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
            ".Tab": { border: "1px solid rgba(255,255,255,0.08)", boxShadow: "none", backgroundColor: "rgba(255,255,255,0.02)" },
            ".Tab:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
            ".Tab--selected": { backgroundColor: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)" },
            ".Input": { backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" },
            ".Input:focus": { border: "1px solid rgba(59,130,246,0.5)", boxShadow: "0 0 0 2px rgba(59,130,246,0.15)" },
            ".Label": { color: "rgba(255,255,255,0.5)" },
        },
    };

    return (
        <div className="w-full">
            <Elements options={{ clientSecret, appearance, locale: "de" as const, loader: "auto" as const }} stripe={stripePromise}>
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
    const [activeMethod, setActiveMethod] = useState<"card" | "klarna" | null>(null);
    const expressRef = useRef<HTMLDivElement>(null);

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
        const storedEmail = sessionStorage.getItem("checkoutEmail");
        if (storedEmail) setEmail(storedEmail);
    }, []);
    useEffect(() => {
        if (!isMounted) return;
        sessionStorage.setItem("checkoutEmail", email);
    }, [email, isMounted]);

    const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    const updateReceiptEmail = useCallback(async (emailValue: string) => {
        if (!paymentIntentId || !validateEmail(emailValue)) return;
        try {
            await fetch("/api/update-payment-intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ paymentIntentId, email: emailValue }) });
        } catch { /* silent */ }
    }, [paymentIntentId]);

    const getReturnUrl = useCallback(() => {
        const base = `${window.location.origin}/bestellung-bestaetigung`;
        const params = new URLSearchParams();
        if (orderId) params.set("order_id", orderId);
        if (trackingNr) params.set("tracking", trackingNr);
        return `${base}?${params.toString()}`;
    }, [orderId, trackingNr]);

    useEffect(() => {
        if (!stripe) return;
        const cs = new URLSearchParams(window.location.search).get("payment_intent_client_secret");
        if (!cs) return;
        stripe.retrievePaymentIntent(cs).then(({ paymentIntent }) => {
            if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
                setMessage("✓ Zahlung erfolgreich! Weiterleitung...");
                sessionStorage.removeItem("cartOpen");
                sessionStorage.removeItem("checkoutOpen");
                window.location.href = getReturnUrl();
            } else setMessage("⚠ Zahlung fehlgeschlagen.");
        });
    }, [stripe, getReturnUrl]);

    const handleProviderClick = useCallback(async (provider: "klarna" | "card") => {
        if (!validateEmail(email)) {
             setEmailError("Bitte gib zuerst eine E-Mail-Adresse ein.");
             return;
        }
        setEmailError("");
        setActiveMethod(activeMethod === provider ? null : provider);
    }, [email, activeMethod]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        if (!validateEmail(email)) { setEmailError("Bitte gib eine gültige E-Mail-Adresse ein."); return; }
        
        setEmailError("");
        setIsLoading(true);
        setMessage(null);
        await updateReceiptEmail(email);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: getReturnUrl(), payment_method_data: { billing_details: { email } } },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message ?? "Ein Fehler ist aufgetreten.");
            setIsLoading(false);
        } else if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
            sessionStorage.removeItem("cartOpen");
            sessionStorage.removeItem("checkoutOpen");
            window.location.href = getReturnUrl();
        } else window.location.href = getReturnUrl();
    }, [stripe, elements, email, getReturnUrl, updateReceiptEmail]);

    const handleExpressConfirm = useCallback(async () => {
        if (!stripe || !elements) return;
        if (!validateEmail(email)) { setEmailError("Bitte gib eine gültige E-Mail-Adresse ein."); setMessage("⚠ E-Mail-Adresse erforderlich."); return; }
        
        await updateReceiptEmail(email);
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: getReturnUrl(), payment_method_data: { billing_details: { email } } },
            redirect: "if_required",
        });

        if (error) {
            if (error.type === "validation_error") return;
            setMessage(error.message ?? "Express-Zahlung fehlgeschlagen.");
        } else if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
            sessionStorage.removeItem("cartOpen");
            sessionStorage.removeItem("checkoutOpen");
            window.location.href = getReturnUrl();
        } else window.location.href = getReturnUrl();
    }, [stripe, elements, email, getReturnUrl, updateReceiptEmail]);

    const handlePayPalClick = useCallback(async () => {
        if (!stripe || !elements) return;
        if (!validateEmail(email)) { setEmailError("Bitte gib eine gültige E-Mail-Adresse ein."); return; }
        
        setEmailError("");
        setIsLoading(true);
        await updateReceiptEmail(email);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: getReturnUrl(), payment_method_data: { billing_details: { email } } },
            redirect: "if_required"
        });

        if (error) {
            setMessage(error.message ?? "PayPal-Zahlung fehlgeschlagen.");
            setIsLoading(false);
        } else if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) {
            sessionStorage.removeItem("cartOpen");
            sessionStorage.removeItem("checkoutOpen");
            window.location.href = getReturnUrl();
        } else window.location.href = getReturnUrl();
    }, [stripe, elements, email, getReturnUrl, updateReceiptEmail]);

    const [confirmedDemo, setConfirmedDemo] = useState(false);

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
                        <h3 className="text-xl font-[family-name:var(--font-outfit)] font-black text-white mb-2 uppercase tracking-tight">Wichtiger Hinweis</h3>
                        <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">Dies ist ein Demo-Modus. Es wird 0,50 € berechnet.</p>
                        <button type="button" onClick={() => setConfirmedDemo(true)} className="w-full py-4 bg-white text-blue-700 font-black uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all shadow-xl active:scale-95">
                            Verstanden & Fortfahren
                        </button>
                    </motion.div>
                </div>
            )}

            <div className={`transition-all duration-700 ${!confirmedDemo ? 'blur-xl grayscale-[0.5] opacity-20 pointer-events-none scale-95' : 'blur-0 opacity-100'}`}>
                <div className="relative z-20">
                    <label className="block text-[10px] text-white/60 uppercase tracking-widest font-bold mb-2">
                        E-Mail-Adresse <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                        onBlur={() => {
                            if (email && !validateEmail(email)) setEmailError("Bitte gib eine gültige E-Mail-Adresse ein.");
                            else { setEmailError(""); updateReceiptEmail(email); }
                        }}
                        placeholder="deine@email.de"
                        className={`w-full px-4 py-3 bg-white/[0.03] border rounded-xl text-white text-sm placeholder:text-white/25 outline-none transition-all font-[family-name:var(--font-dm)] ${emailError ? "border-red-500/50 focus:border-red-500" : "border-white/20 focus:border-blue-500/50"}`}
                    />
                    {emailError ? <p className="text-red-400 text-[11px] mt-1.5 font-medium">{emailError}</p> : <p className="text-[9px] text-white/40 mt-1.5 font-medium tracking-wide">Pflichtfeld · Für Bestellbestätigung & Tracking</p>}
                </div>
            </div>

            <div className={`transition-all duration-500 relative ${(!validateEmail(email) || !confirmedDemo) ? 'blur-md opacity-40 grayscale-[0.5] pointer-events-none select-none scale-[0.98]' : 'blur-0 opacity-100 scale-100'}`}>
                {(!validateEmail(email) && confirmedDemo) && (
                    <div className="absolute inset-x-0 top-12 z-50 flex items-center justify-center">
                        <div className="bg-[#050505]/90 backdrop-blur-xl border border-white/20 px-5 py-3 rounded-full shadow-2xl flex items-center gap-3">
                            <span className="text-[11px] text-white/90 uppercase tracking-widest font-black">↑ Bitte zuerst E-Mail eingeben</span>
                        </div>
                    </div>
                )}

                {/* ─── 2×2 QUICK-PAY GRID ─── */}
                <div className="mt-6">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">
                        Schnell bezahlen
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {/* Apple Pay — uses hidden ExpressCheckoutElement */}
                        <div className="relative">
                            <div ref={expressRef} className="[&_button]:!rounded-xl [&_button]:!h-full [&_iframe]:!rounded-xl overflow-hidden rounded-xl h-[52px]">
                                <ExpressCheckoutElement
                                    onConfirm={handleExpressConfirm}
                                    options={{
                                        paymentMethods: { link: "never", applePay: "always", googlePay: "auto", amazonPay: "never", paypal: "never" },
                                        buttonType: { applePay: "buy", googlePay: "buy" },
                                        buttonTheme: { applePay: "white-outline", googlePay: "white" },
                                        buttonHeight: 52,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Google Pay — fallback button */}
                        <button
                            type="button"
                            onClick={() => {
                                const btn = expressRef.current?.querySelector('button') as HTMLButtonElement | null;
                                if (btn) btn.click();
                                else handleProviderClick("card");
                            }}
                            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-all border border-white/10 hover:border-white/20"
                        >
                            <svg className="h-5" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.44 11.94v3.46h-1.1V7.28h2.9c.72 0 1.33.24 1.83.73.51.48.76 1.07.76 1.74 0 .69-.25 1.27-.76 1.75-.5.48-1.1.72-1.83.72h-1.8v-.28zm0-3.66v2.94h1.82c.43 0 .79-.15 1.08-.46.3-.3.45-.67.45-1.02 0-.35-.15-.71-.45-1.01-.29-.3-.65-.45-1.08-.45h-1.82z" fill="#fff" />
                                <path d="M26.05 10.02c.8 0 1.43.21 1.9.64.46.43.69 1.02.69 1.77v3.57h-1.05v-.8h-.05c-.45.66-1.04.99-1.78.99-.63 0-1.16-.19-1.59-.56-.43-.38-.64-.85-.64-1.42 0-.6.23-1.08.68-1.43.46-.35 1.07-.53 1.83-.53.65 0 1.19.12 1.6.35v-.25c0-.42-.17-.78-.5-1.07-.33-.29-.72-.43-1.16-.43-.66 0-1.19.28-1.57.84l-.97-.61c.57-.83 1.41-1.24 2.5-1.24h.1zm-1.4 4.26c0 .32.14.58.41.79.27.21.59.31.95.31.52 0 .98-.19 1.37-.58.39-.39.59-.84.59-1.36-.34-.27-.81-.4-1.42-.4-.44 0-.81.11-1.1.33-.3.22-.45.5-.45.84l-.35.07z" fill="#fff" />
                                <path d="M33.24 10.2l-3.68 8.42h-1.12l1.37-2.94-2.42-5.48h1.18l1.75 4.19h.02l1.71-4.19h1.19z" fill="#fff" />
                            </svg>
                            <span className="text-sm text-white/70 font-medium">Google Pay</span>
                        </button>

                        {/* PayPal */}
                        <button
                            type="button"
                            onClick={handlePayPalClick}
                            disabled={isLoading}
                            className="group flex items-center justify-center gap-2 py-4 rounded-xl bg-[#FFC439] hover:bg-[#f5bb30] transition-all border border-[#FFC439]/50 disabled:opacity-40"
                        >
                            <svg className="h-5" viewBox="0 0 100 26" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.5 2.5h-6a.8.8 0 0 0-.8.7L4.5 17a.5.5 0 0 0 .5.6h2.9a.8.8 0 0 0 .8-.7l.6-3.9a.8.8 0 0 1 .8-.7h1.9c4 0 6.3-1.9 6.9-5.8.3-1.7 0-3-.8-3.9-.8-1-2.3-1.6-4.4-1.1z" fill="#253B80" />
                                <path d="M36 2.5h-6a.8.8 0 0 0-.8.7L27 17a.5.5 0 0 0 .5.6h3.1a.6.6 0 0 0 .6-.5l.6-3.8a.8.8 0 0 1 .8-.7h1.9c4 0 6.3-1.9 6.9-5.8.3-1.7 0-3-.8-3.9-.8-1-2.3-1.6-4.4-1.1z" fill="#179BD7" />
                                <path d="M53 7.3h-3a.5.5 0 0 0-.5.4l-.1.9-.2-.3c-.7-1-2.2-1.3-3.7-1.3-3.4 0-6.3 2.6-6.9 6.2-.3 1.8.1 3.5 1.2 4.7.9 1.1 2.3 1.6 3.9 1.6 2.8 0 4.3-1.8 4.3-1.8l-.1.9a.5.5 0 0 0 .5.6h2.8a.8.8 0 0 0 .8-.7l1.7-10.5a.5.5 0 0 0-.5-.7z" fill="#179BD7" />
                                <path d="M57.7 2.5L55.3 17a.5.5 0 0 0 .5.6h2.6a.8.8 0 0 0 .8-.7L61.4 3.2a.5.5 0 0 0-.5-.6h-2.8a.5.5 0 0 0-.4 0z" fill="#179BD7" />
                            </svg>
                        </button>

                        {/* Klarna */}
                        <button
                            type="button"
                            onClick={() => handleProviderClick("klarna")}
                            className={`flex items-center justify-center py-4 rounded-xl transition-all border ${activeMethod === "klarna"
                                ? "bg-pink-500/10 border-pink-500/30 text-pink-400"
                                : "bg-[#FFA8C5]/10 border-[#FFA8C5]/20 hover:bg-[#FFA8C5]/20 hover:border-[#FFA8C5]/30"
                                }`}
                        >
                            <svg viewBox="0 0 68 32" className="h-4 w-auto fill-white" xmlns="http://www.w3.org/2000/svg">
                                <text x="0" y="24" fontFamily="Arial" fontSize="22" fontWeight="700" fill="white">klarna</text>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ─── KARTENZAHLUNG & ANDERE ─── */}
                <div className="mt-4">
                    <button
                        type="button"
                        onClick={() => handleProviderClick("card")}
                        className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl transition-all border ${activeMethod === "card"
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            : "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                            }`}
                    >
                        <span className="text-sm font-medium">💳 Kartenzahlung, SEPA & Andere</span>
                    </button>
                </div>

                {/* ─── DIVIDER ─── */}
                {activeMethod && (
                    <div className="relative flex items-center gap-3 my-6">
                        <div className="flex-grow border-t border-white/8" />
                        <span className="text-[10px] text-white/25 uppercase tracking-widest shrink-0">Daten eingeben</span>
                        <div className="flex-grow border-t border-white/8" />
                    </div>
                )}

                {/* ─── PAYMENT ELEMENT: ONLY RENDERED IF KLARNA OR CARD IS SELECTED ─── */}
                <div className={activeMethod ? "block" : "hidden"}>
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
                            paymentMethodOrder: activeMethod === "klarna" ? ["klarna", "card", "sepa_debit"] : ["card", "sepa_debit", "klarna"],
                        }}
                    />
                </div>

                {/* ─── SUBMIT BUTTON ─── */}
                {activeMethod && (
                    <button
                        type="submit"
                        disabled={isLoading || !stripe || !elements || !validateEmail(email)}
                        className="w-full py-4 bg-white text-black font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.08)] mt-2 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                Verarbeiten...
                            </span>
                        ) : "JETZT KAUFEN — 0,50 €"}
                    </button>
                )}

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
