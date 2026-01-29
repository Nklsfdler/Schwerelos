"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { X, Lock, CreditCard, Box, CheckCircle } from "lucide-react";

export function CartOverlay() {
    const { isOpen, closeCart, openCheckout } = useCart();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999]"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0A0A0A] border-l border-white/10 z-[1000] p-8 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl font-[family-name:var(--font-outfit)] font-bold uppercase">Warenkorb</h2>
                            <button onClick={closeCart} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5 text-white/60" />
                            </button>
                        </div>

                        {/* CART ITEM */}
                        <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
                            <div className="w-20 h-24 bg-neutral-800 rounded-lg overflow-hidden">
                                <img src="/sequence/schwerelos/Design_ohne_Titel_100.jpg" className="w-full h-full object-cover opacity-80" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-[family-name:var(--font-outfit)] font-bold text-lg">Schwerelos</h3>
                                    <p className="text-xs text-white/50 font-[family-name:var(--font-dm)]">Edition 01 / Edelstahl</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-sm font-light">1 x</p>
                                    <p className="font-bold">159,00 €</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="border-t border-white/10 py-6 text-sm space-y-3 font-[family-name:var(--font-dm)]">
                                <div className="flex justify-between text-white/60">
                                    <span>Zwischensumme</span>
                                    <span>159,00 €</span>
                                </div>
                                <div className="flex justify-between text-white/60">
                                    <span>Versand</span>
                                    <span>0,00 €</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10">
                                    <span>Gesamt</span>
                                    <span>159,00 €</span>
                                </div>
                            </div>
                            <button
                                onClick={openCheckout}
                                className="w-full py-4 bg-white text-black font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-colors"
                            >
                                Zur Kasse
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// --- FACE ID ANIMATION ---
function FaceIDOverlay({ onComplete }: { onComplete: () => void }) {
    React.useEffect(() => {
        const timer = setTimeout(onComplete, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F5F7] z-30">
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8 relative w-24 h-24"
            >
                {/* Simulated Face ID Glyph Animation */}
                <svg viewBox="0 0 50 50" className="w-full h-full text-[#007AFF]">
                    <motion.path
                        d="M15 25 C15 19 19 15 25 15 C31 15 35 19 35 25"
                        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    />
                    <motion.path
                        d="M15 25 L15 30 C15 36 19 40 25 40 C31 40 35 36 35 30 L35 25"
                        fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    />
                    {/* Eyes */}
                    <circle cx="20" cy="22" r="2" fill="currentColor" />
                    <circle cx="30" cy="22" r="2" fill="currentColor" />
                </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-black mb-1">Face ID</h3>
        </div>
    );
}

// --- REALISTIC DELIVERY ANIMATION ---
function DeliveryStatus({ onComplete }: { onComplete: () => void }) {
    const [status, setStatus] = useState("Bestellung wird verarbeitet...");
    const [progress, setProgress] = useState(5);
    const [activeStep, setActiveStep] = useState(0);

    React.useEffect(() => {
        // We only animate up to "Data Received" (Step 1 Complete)
        // User wants: Payment -> Processing -> Data Transmitted -> STOP.
        // Future steps (Packing, Shipping) remain unticked.

        const timeline = [
            { t: 1000, p: 20, s: "Zahlung verifiziert...", step: 0 },
            { t: 3000, p: 50, s: "Daten werden verschlüsselt...", step: 0 },
            { t: 5000, p: 100, s: "Erfolgreich an Logistik übermittelt", step: 1 }
        ];

        let timeouts: NodeJS.Timeout[] = [];

        timeline.forEach((point) => {
            const timer = setTimeout(() => {
                setStatus(point.s);
                if (point.step === 0 && point.p > progress) setProgress(point.p);
                if (point.step === 1) {
                    setProgress(100);
                    setActiveStep(1);
                    // Stop here, then finish
                    setTimeout(onComplete, 3000);
                }
            }, point.t);
            timeouts.push(timer);
        });

        return () => timeouts.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto px-8 relative">

            {/* Truck Visual (Static or slightly animating in place) */}
            <div className="mb-12 relative">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                    {/* SVG Truck Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 17h4" />
                        <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5" />
                        <path d="M14 17h1" />
                        <circle cx="7.5" cy="17.5" r="2.5" />
                        <circle cx="17.5" cy="17.5" r="2.5" />
                        <path d="M2 17h2" />
                        <path d="M5 17h5" />
                        <path d="M5 12h10" />
                        <path d="M2 5h13v12H5V5z" />
                    </svg>
                </div>
                {/* Status Pulse */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-full text-center">
                    <span className="text-[10px] uppercase tracking-widest text-blue-400 animate-pulse">Live Verbindung</span>
                </div>
            </div>

            <h3 className="text-3xl font-[family-name:var(--font-outfit)] font-bold text-white mb-8 text-center">
                {status}
            </h3>

            {/* REALISTIC PROGRESS TIMELINE */}
            <div className="w-full max-w-lg space-y-6">
                {/* Step 1: Data Transfer (Active/Completing) */}
                <div className="relative pl-8 border-l-2 border-blue-500">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    <h4 className="text-white font-bold text-lg leading-none mb-1">Datenübertragung</h4>
                    <p className="text-blue-400 text-xs uppercase tracking-wider">
                        {activeStep >= 1 ? "Abgeschlossen" : "Wird verarbeitet..."}
                    </p>
                </div>

                {/* Step 2: Logistics (Pending) */}
                <div className="relative pl-8 border-l-2 border-white/10">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-white/20" />
                    <h4 className="text-white/40 font-bold text-lg leading-none mb-1">Kommissionierung</h4>
                    <p className="text-white/20 text-xs uppercase tracking-wider">Ausstehend</p>
                </div>

                {/* Step 3: Transit (Pending) */}
                <div className="relative pl-8 border-l-2 border-white/10">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-white/20" />
                    <h4 className="text-white/40 font-bold text-lg leading-none mb-1">Versand</h4>
                    <p className="text-white/20 text-xs uppercase tracking-wider">Ausstehend</p>
                </div>

                {/* Step 4: Delivery (Pending) */}
                <div className="relative pl-8 border-l-2 border-transparent">
                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-white/20" />
                    <h4 className="text-white/40 font-bold text-lg leading-none mb-1">Zustellung</h4>
                    <p className="text-white/20 text-xs uppercase tracking-wider">Ausstehend</p>
                </div>
            </div>
        </div>
    );
}

export function CheckoutOverlay() {
    const { isCheckoutOpen, closeCheckout } = useCart();
    const [step, setStep] = useState(1); // 1=Select, 2=Input, 3=Animation, 4=Success
    const [selectedMethod, setSelectedMethod] = useState<"card" | "apple" | "paypal" | null>(null);
    const [showAppleSheet, setShowAppleSheet] = useState(false);
    const [appleSheetStage, setAppleSheetStage] = useState<"details" | "processing" | "faceid" | "success">("details");

    const handleExpressStart = (method: "apple" | "paypal" | "card") => {
        setSelectedMethod(method);
        setStep(2);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedMethod === "apple") {
            // OPEN NATIVE SHEET FIRST
            setShowAppleSheet(true);
            setAppleSheetStage("details");
        } else {
            // Direct to animation for others
            setStep(3);
        }
    };

    const confirmApplePay = () => {
        setAppleSheetStage("processing");

        // 1. Processing Spin
        setTimeout(() => {
            setAppleSheetStage("faceid");

            // 2. Face ID Scan
            setTimeout(() => {
                setAppleSheetStage("success");

                // 3. Success -> Close Sheet -> Start Truck
                setTimeout(() => {
                    setShowAppleSheet(false);
                    setStep(3); // Start TRUCK
                }, 1500);
            }, 2500);
        }, 1500);
    };

    const handleAnimationComplete = () => {
        setStep(4); // Success
    };

    return (
        <AnimatePresence>
            {/* --- NATIVE APPLE PAY SHEET --- */}
            {showAppleSheet && (
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    className="fixed inset-0 z-[2200] flex items-end justify-center sm:items-center pointer-events-none"
                >
                    <div className="w-full h-full absolute inset-0 bg-black/40 pointer-events-auto" onClick={() => setShowAppleSheet(false)} />
                    <motion.div
                        initial={{ y: 100 }} animate={{ y: 0 }}
                        className="w-full sm:w-[420px] bg-[#F5F5F7] rounded-t-[20px] sm:rounded-[20px] overflow-hidden relative z-10 pointer-events-auto shadow-2xl"
                    >
                        {/* HEADER */}
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#F5F5F7]">
                            <div className="w-8" />
                            <div className="flex items-center gap-1">
                                <img src="/logos/applepay.png" className="h-4 w-auto object-contain brightness-0" />
                                <span className="font-semibold text-black">Pay</span>
                            </div>
                            <button onClick={() => setShowAppleSheet(false)} className="text-[#007AFF] font-medium text-sm">Abbrechen</button>
                        </div>

                        {/* CONTENT */}
                        <div className="p-6 min-h-[300px] flex flex-col relative">
                            {appleSheetStage === "details" && (
                                <>
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                                            <span className="text-gray-400 text-xs uppercase font-medium">Karte</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-5 bg-black rounded flex items-center justify-center text-[8px] text-white font-bold">VISA</div>
                                                <span className="text-black text-sm font-medium">Sparkasse •••• 1234</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
                                            <span className="text-gray-400 text-xs uppercase font-medium">Versand</span>
                                            <span className="text-black text-sm font-medium">An E-Mail Adresse</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-xs uppercase font-medium">BETRAG</span>
                                            <span className="text-black text-lg font-bold">159,00 €</span>
                                        </div>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="flex flex-col items-center gap-2 mb-4">
                                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white mb-2 cursor-pointer hover:scale-105 transition-transform" onClick={confirmApplePay}>
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium">Zweimal drücken zum Bezahlen</p>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* LOADING / PROCESSING */}
                            {appleSheetStage === "processing" && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F5F7]/80 backdrop-blur-sm z-20">
                                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mb-4" />
                                    <p className="text-sm font-medium text-black">Verarbeiten...</p>
                                </div>
                            )}

                            {/* FACE ID */}
                            {appleSheetStage === "faceid" && (
                                <div className="absolute inset-0 z-50">
                                    <FaceIDOverlay onComplete={() => { }} />
                                </div>
                            )}

                            {/* SUCCESS */}
                            {appleSheetStage === "success" && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F5F7] z-40">
                                    <div className="w-16 h-16 bg-[#007AFF] rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-black">Fertig</h3>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {isCheckoutOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCheckout}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-5xl bg-[#09090B] rounded-[24px] overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[700px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                    >
                        {/* LEFT: ORDER SUMMARY */}
                        <div className="w-full md:w-1/3 bg-[#050505] p-8 md:p-10 border-r border-white/5 flex flex-col relative grid-pattern">
                            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-10 font-[family-name:var(--font-outfit)] font-bold">Bestellübersicht</h3>
                            <div className="flex gap-5 items-center mb-8">
                                <div className="w-20 h-20 bg-[#111] rounded-2xl overflow-hidden shadow-sm border border-white/10 p-1">
                                    <img src="/sequence/schwerelos/Design_ohne_Titel_100.jpg" className="w-full h-full object-cover rounded-xl opacity-80" />
                                </div>
                                <div>
                                    <h3 className="font-[family-name:var(--font-outfit)] font-bold text-white text-lg">Schwerelos</h3>
                                    <p className="text-xs text-white/40 font-[family-name:var(--font-dm)] mt-1">Edition 01 / Obsidian</p>
                                    <p className="text-sm font-bold text-white/90 mt-2">159,00 €</p>
                                </div>
                            </div>
                            <div className="mt-auto space-y-4 text-sm font-[family-name:var(--font-dm)]">
                                <div className="flex justify-between border-t border-white/5 pt-4">
                                    <span className="text-white/40">Zwischensumme</span>
                                    <span className="font-medium text-white/80">159,00 €</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-4 text-lg">
                                    <span className="font-bold text-white">Gesamt</span>
                                    <span className="font-bold text-blue-400">159,00 €</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: CHECKOUT PROCESS */}
                        <div className="w-full md:w-2/3 bg-[#0A0A0C] p-8 md:p-12 relative flex flex-col overflow-y-auto">
                            <button onClick={closeCheckout} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-50">
                                <X className="w-5 h-5 text-white/40" />
                            </button>

                            {/* STEP 1: METHOD SELECTION */}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col max-w-lg mx-auto w-full pt-4">
                                    <h2 className="text-3xl font-[family-name:var(--font-outfit)] font-bold text-white mb-2">Express Checkout</h2>
                                    <p className="text-white/40 mb-8 font-[family-name:var(--font-dm)] text-sm">Wähle deine bevorzugte Zahlungsmethode.</p>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <button onClick={() => handleExpressStart("apple")} className="group h-16 bg-white hover:bg-gray-100 rounded-xl flex items-center justify-center transition-all relative overflow-hidden">
                                            <img src="/logos/applepay.png" className="h-10 w-auto" alt="Apple Pay" />
                                        </button>
                                        <button onClick={() => handleExpressStart("paypal")} className="group h-16 bg-[#FFC439] hover:bg-[#F4BB36] rounded-xl flex items-center justify-center transition-all">
                                            <img src="/logos/paypal.png" className="h-8 w-auto" alt="PayPal" />
                                        </button>
                                    </div>
                                    <div className="relative py-8 flex items-center">
                                        <div className="flex-grow border-t border-white/10"></div>
                                        <span className="flex-shrink mx-4 text-white/30 text-xs uppercase tracking-widest font-bold">Oder Kreditkarte</span>
                                        <div className="flex-grow border-t border-white/10"></div>
                                    </div>
                                    <button onClick={() => handleExpressStart("card")} className="w-full py-4 bg-white/10 text-white hover:bg-white hover:text-black font-bold rounded-xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                                        <CreditCard className="w-4 h-4" /> Kartenzahlung
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 2: INPUT DETAILS */}
                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col max-w-lg mx-auto w-full pt-4">
                                    <button onClick={() => setStep(1)} className="text-xs text-white/40 hover:text-white mb-6 uppercase tracking-widest">← Zurück</button>
                                    <h2 className="text-3xl font-[family-name:var(--font-outfit)] font-bold text-white mb-2">
                                        {selectedMethod === "apple" ? "Apple Pay bestätigen" : "Lieferdetails"}
                                    </h2>

                                    <div className="flex items-center gap-2 mb-8">
                                        <span className="text-sm text-white/60">Zahlung via</span>
                                        {selectedMethod === "apple" && <span className="px-2 py-0.5 bg-white text-black text-xs font-bold rounded">Apple Pay</span>}
                                        {selectedMethod === "paypal" && <span className="px-2 py-0.5 bg-[#FFC439] text-black text-xs font-bold rounded">PayPal</span>}
                                        {selectedMethod === "card" && <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">Karte</span>}
                                    </div>

                                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                        {/* NAME & EMAIL FIELDS (Always visible) */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="Vorname" className="bg-white/5 border border-white/5 p-4 rounded-xl text-white focus:bg-white/10 outline-none transition-all" required />
                                            <input type="text" placeholder="Nachname" className="bg-white/5 border border-white/5 p-4 rounded-xl text-white focus:bg-white/10 outline-none transition-all" required />
                                        </div>
                                        <input type="email" placeholder="E-Mail Adresse" className="w-full bg-white/5 border border-white/5 p-4 rounded-xl text-white focus:bg-white/10 outline-none transition-all" required />

                                        {/* Show Address ONLY if NOT Apple Pay */}
                                        {selectedMethod !== "apple" && (
                                            <>
                                                <input type="text" placeholder="Straße & Hausnummer" className="w-full bg-white/5 border border-white/5 p-4 rounded-xl text-white focus:bg-white/10 outline-none transition-all" required />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input type="text" placeholder="PLZ" className="bg-white/5 border border-white/5 p-4 rounded-xl text-white focus:bg-white/10 outline-none transition-all" required />
                                                    <input type="text" placeholder="Stadt" className="bg-white/5 border border-white/5 p-4 rounded-xl text-white focus:bg-white/10 outline-none transition-all" required />
                                                </div>
                                            </>
                                        )}

                                        <button className="mt-8 w-full py-4 bg-white text-black hover:bg-neutral-200 font-[family-name:var(--font-outfit)] font-bold rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3">
                                            {selectedMethod === "apple" ? (
                                                <>
                                                    Mit Apple Pay bezahlen
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4" />
                                                    Bestellung absenden
                                                </>
                                            )}
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {/* STEP 3: TRUCK ANIMATION */}
                            {step === 3 && (
                                <DeliveryStatus onComplete={handleAnimationComplete} />
                            )}

                            {/* STEP 4: SUCCESS */}
                            {step === 4 && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                                    <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(59,130,246,0.2)] border border-blue-500/20">
                                        <CheckCircle className="w-12 h-12 text-blue-400" />
                                    </div>
                                    <h2 className="text-4xl font-[family-name:var(--font-outfit)] font-bold text-white mb-4">Lieferung gestartet!</h2>
                                    <p className="text-white/60 max-w-sm mb-12 leading-relaxed">
                                        Deine Daten wurden an Station 1 übermittelt. Wir melden uns, sobald das Paket den nächsten Checkpoint erreicht.
                                    </p>
                                    <button onClick={closeCheckout} className="px-8 py-3 border border-white/20 rounded-full hover:bg-white hover:text-black transition-all uppercase text-xs tracking-widest font-bold">
                                        Zurück zur Website
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
