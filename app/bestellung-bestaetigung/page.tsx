"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ─── Helpers ─── */
function generateOrderId(): string {
    return `SCH-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`;
}
function generateTrackingNumber(): string {
    return `JD${Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join("")}`;
}
function getDeliveryEstimate(): string {
    const d = new Date();
    let added = 0;
    const target = 5 + Math.floor(Math.random() * 4);
    while (added < target) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) added++;
    }
    return d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/* ─── DELIVERY STEPS ─── */
const STEPS = [
    { icon: "check", label: "Bestellung bestätigt", desc: "Deine Zahlung wurde erfolgreich verarbeitet" },
    { icon: "package", label: "Wird verpackt", desc: "Dein Schwerelos wird sorgfältig eingepackt" },
    { icon: "truck", label: "Versand", desc: "DHL Express holt dein Paket ab" },
    { icon: "home", label: "Zustellung", desc: "Voraussichtlich in 5–8 Werktagen" },
];

/* ─── SVG ICONS ─── */
function StepIcon({ type, active }: { type: string; active: boolean }) {
    const color = active ? "#3b82f6" : "rgba(255,255,255,0.15)";
    const props = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

    if (type === "check") return (
        <svg {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
    );
    if (type === "package") return (
        <svg {...props}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
    );
    if (type === "truck") return (
        <svg {...props}><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
    );
    return (
        <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
    );
}

/* ─── ANIMATED DELIVERY TRUCK ─── */
function DeliveryAnimation() {
    return (
        <div className="relative w-full max-w-lg mx-auto h-32 overflow-hidden my-8">
            {/* Road */}
            <div className="absolute bottom-6 left-0 right-0 h-[2px] bg-white/10" />
            <div className="absolute bottom-6 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-blue-500/0 animate-pulse" />

            {/* Road dashes */}
            <motion.div
                className="absolute bottom-[25px] flex gap-8"
                initial={{ x: "100%" }}
                animate={{ x: "-200%" }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="w-6 h-[1px] bg-white/10" />
                ))}
            </motion.div>

            {/* Truck */}
            <motion.div
                className="absolute bottom-8"
                initial={{ x: "-20%", opacity: 0 }}
                animate={{ x: "55%", opacity: 1 }}
                transition={{ duration: 2.5, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <svg width="80" height="48" viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Trailer */}
                        <rect x="0" y="8" width="45" height="28" rx="3" fill="#1a1a2e" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
                        <text x="22" y="26" textAnchor="middle" fontSize="7" fontWeight="bold" fill="rgba(59,130,246,0.5)" fontFamily="Arial">SCH</text>
                        {/* Cabin */}
                        <rect x="45" y="16" width="20" height="20" rx="3" fill="#1a1a2e" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
                        {/* Window */}
                        <rect x="50" y="19" width="12" height="7" rx="1.5" fill="rgba(59,130,246,0.15)" />
                        {/* Bumper */}
                        <rect x="65" y="28" width="5" height="8" rx="1" fill="#1a1a2e" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                        {/* Wheels */}
                        <circle cx="12" cy="38" r="5" fill="#111" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        <circle cx="12" cy="38" r="2" fill="rgba(255,255,255,0.1)" />
                        <circle cx="55" cy="38" r="5" fill="#111" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                        <circle cx="55" cy="38" r="2" fill="rgba(255,255,255,0.1)" />
                        {/* Headlights */}
                        <rect x="67" y="24" width="3" height="3" rx="0.5" fill="rgba(255,200,50,0.6)" />
                    </svg>
                </motion.div>
            </motion.div>

            {/* Exhaust particles */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="absolute bottom-12 left-[30%] w-2 h-2 rounded-full bg-white/5"
                    initial={{ x: 0, opacity: 0.4, scale: 0.5 }}
                    animate={{ x: -80, opacity: 0, scale: 2 }}
                    transition={{ duration: 2, delay: 1 + i * 0.3, repeat: Infinity }}
                />
            ))}

            {/* Speed lines */}
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={`line-${i}`}
                    className="absolute h-[1px] bg-gradient-to-r from-blue-500/20 to-transparent"
                    style={{ bottom: 14 + i * 6, width: 20 + Math.random() * 20 }}
                    initial={{ x: "70vw", opacity: 0 }}
                    animate={{ x: "-10vw", opacity: [0, 0.6, 0] }}
                    transition={{ duration: 1.5, delay: 1.5 + i * 0.15, repeat: Infinity, repeatDelay: 0.5 }}
                />
            ))}
        </div>
    );
}

/* ─── TIMELINE PROGRESS ─── */
function Timeline({ activeStep }: { activeStep: number }) {
    return (
        <div className="w-full max-w-md mx-auto mb-10">
            <div className="flex items-start justify-between relative">
                {/* Connecting line */}
                <div className="absolute top-[14px] left-[14px] right-[14px] h-[2px] bg-white/5 z-0" />
                <motion.div
                    className="absolute top-[14px] left-[14px] h-[2px] bg-blue-500/50 z-0"
                    initial={{ width: 0 }}
                    animate={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    style={{ maxWidth: 'calc(100% - 28px)' }}
                />

                {STEPS.map((step, i) => (
                    <motion.div
                        key={i}
                        className="flex flex-col items-center z-10 relative"
                        style={{ width: `${100 / STEPS.length}%` }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.3, duration: 0.5 }}
                    >
                        <motion.div
                            className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 transition-all duration-500 ${i <= activeStep
                                    ? "bg-blue-500/20 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                    : "bg-white/5 border border-white/10"
                                }`}
                            animate={i === activeStep ? { scale: [1, 1.15, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <StepIcon type={step.icon} active={i <= activeStep} />
                        </motion.div>
                        <p className={`text-[9px] text-center font-bold uppercase tracking-wider ${i <= activeStep ? "text-blue-400/80" : "text-white/20"
                            }`}>
                            {step.label}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

/* ─── MAIN CONTENT ─── */
function ConfirmationContent() {
    const params = useSearchParams();
    const [orderId, setOrderId] = useState("");
    const [trackingNr, setTrackingNr] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [activeStep, setActiveStep] = useState(0);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        setOrderId(params.get("order_id") || generateOrderId());
        setTrackingNr(params.get("tracking") || generateTrackingNumber());
        setDeliveryDate(getDeliveryEstimate());
    }, [params]);

    /* Animate through steps */
    useEffect(() => {
        const timers = [
            setTimeout(() => setActiveStep(1), 2000),
            setTimeout(() => setActiveStep(2), 4000),
            setTimeout(() => setActiveStep(3), 6000),
            setTimeout(() => setShowDetails(true), 3500),
        ];
        return () => timers.forEach(clearTimeout);
    }, []);

    return (
        <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center px-4 py-12 relative overflow-hidden">

            {/* Background effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-blue-600/3 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-purple-600/3 blur-[120px] pointer-events-none" />

            {/* Floating particles */}
            {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-blue-500/20"
                    style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}
                    animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
                />
            ))}

            {/* Success checkmark */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 border border-blue-500/30 flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(59,130,246,0.2)] mt-8 relative"
            >
                <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping opacity-30" />
                <svg className="w-12 h-12 text-blue-400 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    />
                </svg>
            </motion.div>

            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-6"
            >
                <motion.p
                    className="text-xs text-blue-400/80 uppercase tracking-[0.3em] font-bold mb-3"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Bestellung bestätigt
                </motion.p>
                <h1 className="text-5xl md:text-6xl font-[family-name:var(--font-outfit)] font-bold text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text">
                    Vielen Dank!
                </h1>
                <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                    Deine Bestellung wird jetzt vorbereitet.<br />
                    Wir halten dich über jeden Schritt auf dem Laufenden.
                </p>
            </motion.div>

            {/* Delivery Truck Animation */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1 }}
            >
                <DeliveryAnimation />
            </motion.div>

            {/* Timeline */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="w-full"
            >
                <Timeline activeStep={activeStep} />
            </motion.div>

            {/* Current step description */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center mb-8"
                >
                    <p className="text-blue-400 font-bold text-sm mb-1">{STEPS[activeStep].label}</p>
                    <p className="text-white/30 text-xs">{STEPS[activeStep].desc}</p>
                </motion.div>
            </AnimatePresence>

            {/* Order Details Card */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full max-w-md bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-3xl p-8 mb-6 backdrop-blur-sm relative overflow-hidden"
                    >
                        {/* Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-blue-500/10 blur-[50px] pointer-events-none" />

                        {/* Product */}
                        <div className="flex items-center gap-4 pb-6 border-b border-white/8 mb-6 relative z-10">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex-shrink-0">
                                <img src="/Produktbilder/Produktbild.png" className="w-full h-full object-cover opacity-70" alt="Schwerelos" />
                            </div>
                            <div>
                                <p className="font-[family-name:var(--font-outfit)] font-bold text-white">Schwerelos</p>
                                <p className="text-xs text-white/40 mt-0.5">Edition 01 / Obsidian · 1 Stück</p>
                                <p className="text-sm font-bold text-white/70 mt-1">33,99 €</p>
                            </div>
                        </div>

                        {/* Info rows */}
                        <div className="space-y-4 relative z-10">
                            <InfoRow label="Bestellnummer" value={orderId} mono />
                            <InfoRow label="Sendungsnummer" value={trackingNr} mono />
                            <InfoRow label="Lieferung" value={deliveryDate} />
                            <InfoRow label="Versand" value="DHL Express" />
                            <InfoRow label="Status" value="In Vorbereitung" badge />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4.5 }}
                className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-md"
            >
                {trackingNr && (
                    <a
                        href={`https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${trackingNr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-[family-name:var(--font-outfit)] font-bold uppercase tracking-wider"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        Sendung verfolgen
                    </a>
                )}
                <Link
                    href="/"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-full font-[family-name:var(--font-outfit)] font-bold uppercase tracking-wider text-sm hover:bg-blue-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.06)]"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Zurück zur Website
                </Link>
            </motion.div>

            {/* Returns / Help Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5 }}
                className="w-full max-w-md p-5 rounded-2xl border border-white/5 bg-white/[0.02] mb-8"
            >
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-white/20 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 14l-4-4 4-4" /><path d="M5 10h11a4 4 0 0 1 0 8h-1" />
                    </svg>
                    <div>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Rückgabe & Support</p>
                        <p className="text-[11px] text-white/25 leading-relaxed">
                            14 Tage kostenlose Rückgabe. Bei Fragen oder Retouren schreib uns an{" "}
                            <a href="mailto:hallo@nfd.studio" className="text-blue-400/60 hover:text-blue-400 transition-colors">hallo@nfd.studio</a>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Demo notice */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5.5 }}
                className="w-full max-w-md p-3 rounded-xl border border-blue-500/10 bg-blue-500/5 mb-8"
            >
                <p className="text-[10px] text-blue-300/50 text-center leading-relaxed">
                    <strong>Demo:</strong> Es wurden 0,50 € verarbeitet. Keine echte Lieferung.
                </p>
            </motion.div>

            {/* Branding */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 6 }}
                className="text-[10px] text-white/10 uppercase tracking-widest"
            >
                NFD Niklas Fiedler Design · nfd.studio
            </motion.p>
        </div>
    );
}

function InfoRow({ label, value, mono, badge }: { label: string; value: string; mono?: boolean; badge?: boolean }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-xs text-white/30 shrink-0">{label}</span>
            {badge ? (
                <motion.span
                    className="text-xs px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {value}
                </motion.span>
            ) : (
                <span className={`text-xs text-right text-white/60 break-all ${mono ? "font-mono tracking-tight" : ""}`}>
                    {value}
                </span>
            )}
        </div>
    );
}

export default function BestellungBestaetigung() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050507] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        }>
            <ConfirmationContent />
        </Suspense>
    );
}
