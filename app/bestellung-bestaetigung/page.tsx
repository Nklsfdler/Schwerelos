"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ─── UTILITIES ─── */
function generateOrderId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `SCH-${year}-${random}`;
}

function generateTrackingNumber(): string {
    const digits = Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join("");
    return `JD${digits}`;
}

function getDeliveryEstimate(): string {
    const today = new Date();
    let daysAdded = 0;
    const targetDays = 5 + Math.floor(Math.random() * 4);
    const date = new Date(today);
    while (daysAdded < targetDays) {
        date.setDate(date.getDate() + 1);
        const day = date.getDay();
        if (day !== 0 && day !== 6) daysAdded++;
    }
    return date.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/* ─── ANIMATED TRUCK SVG ─── */
function DeliveryTruck() {
    return (
        <div className="relative w-full h-40 overflow-hidden my-8">
            {/* Road */}
            <div className="absolute bottom-4 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <motion.div className="absolute bottom-5 left-0 right-0 flex gap-12" animate={{ x: [0, -200] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="w-8 h-[2px] bg-white/10 shrink-0" />
                ))}
            </motion.div>

            {/* Truck */}
            <motion.div
                className="absolute bottom-6"
                initial={{ x: "-100%" }}
                animate={{ x: "40%" }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
            >
                <svg width="120" height="70" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Cargo */}
                    <motion.rect x="0" y="10" width="70" height="45" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <motion.text x="35" y="38" textAnchor="middle" fontSize="7" fontWeight="bold" fill="rgba(255,255,255,0.25)" fontFamily="sans-serif" letterSpacing="2">
                        SCH
                    </motion.text>
                    {/* Cabin */}
                    <rect x="70" y="25" width="35" height="30" rx="4" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.3)" strokeWidth="1" />
                    {/* Window */}
                    <rect x="80" y="30" width="20" height="12" rx="2" fill="rgba(59,130,246,0.2)" />
                    {/* Wheels */}
                    <motion.circle cx="20" cy="57" r="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
                        animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} />
                    <motion.circle cx="90" cy="57" r="7" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
                        animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }} />
                    {/* Wheel hubs */}
                    <circle cx="20" cy="57" r="2" fill="rgba(255,255,255,0.15)" />
                    <circle cx="90" cy="57" r="2" fill="rgba(255,255,255,0.15)" />
                </svg>
            </motion.div>

            {/* Speed lines */}
            <motion.div
                className="absolute bottom-16 left-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 1 }}
            >
                <div className="flex flex-col gap-2">
                    <div className="w-12 h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
                    <div className="w-8 h-[1px] bg-gradient-to-r from-white/15 to-transparent ml-2" />
                    <div className="w-16 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                </div>
            </motion.div>
        </div>
    );
}

/* ─── PACKAGING ANIMATION ─── */
function PackagingAnimation() {
    return (
        <div className="relative w-full h-32 flex items-center justify-center my-4">
            {/* Box */}
            <motion.div
                className="relative"
                initial={{ scale: 0, rotateY: -90 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}
            >
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Box body */}
                    <rect x="10" y="25" width="60" height="45" rx="3" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    {/* Box flaps */}
                    <motion.path d="M10 25 L40 10 L70 25" stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="rgba(255,255,255,0.03)"
                        initial={{ d: "M10 25 L40 5 L70 25" }}
                        animate={{ d: "M10 25 L40 18 L70 25" }}
                        transition={{ duration: 1, delay: 1 }}
                    />
                    {/* Tape */}
                    <motion.rect x="35" y="25" width="10" height="45" rx="1" fill="rgba(59,130,246,0.2)"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.5, delay: 1.5 }}
                    />
                    {/* Checkmark on box */}
                    <motion.path d="M30 50 L38 58 L55 40" stroke="rgba(59,130,246,0.4)" strokeWidth="2" strokeLinecap="round" fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 2 }}
                    />
                </svg>
            </motion.div>

            {/* Sparkles */}
            {[0, 1, 2, 3, 4, 5].map(i => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                        x: Math.cos(i * 60 * Math.PI / 180) * 60,
                        y: Math.sin(i * 60 * Math.PI / 180) * 60,
                    }}
                    transition={{ duration: 1.2, delay: 2.2 + i * 0.1, ease: "easeOut" }}
                />
            ))}
        </div>
    );
}

/* ─── TIMELINE STEP ─── */
function TimelineStep({ icon, title, subtitle, delay, isActive, isLast }: {
    icon: React.ReactNode; title: string; subtitle: string; delay: number; isActive?: boolean; isLast?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="flex gap-4 relative"
        >
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 ${isActive
                    ? "bg-blue-500/20 border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    : "bg-white/[0.03] border-white/10"
                    }`}>
                    {icon}
                </div>
                {!isLast && (
                    <motion.div
                        className="w-[1px] h-12 bg-gradient-to-b from-white/15 to-transparent"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: delay + 0.3, duration: 0.5 }}
                    />
                )}
            </div>
            <div className="pt-2 pb-6">
                <p className={`text-sm font-bold ${isActive ? "text-blue-400" : "text-white/60"}`}>{title}</p>
                <p className="text-xs text-white/30 mt-0.5">{subtitle}</p>
            </div>
        </motion.div>
    );
}

/* ─── MAIN CONFIRMATION CONTENT ─── */
function ConfirmationContent() {
    const params = useSearchParams();
    const [orderId, setOrderId] = useState("");
    const [trackingNr, setTrackingNr] = useState("");
    const [rechnungsNr, setRechnungsNr] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [showTimeline, setShowTimeline] = useState(false);
    const [showTruck, setShowTruck] = useState(false);

    useEffect(() => {
        setOrderId(params.get("order_id") || generateOrderId());
        setTrackingNr(params.get("tracking") || generateTrackingNumber());
        setRechnungsNr(params.get("payment_intent") || params.get("pi") || "");
        setDeliveryDate(getDeliveryEstimate());
        const t1 = setTimeout(() => setShowTimeline(true), 2800);
        const t2 = setTimeout(() => setShowTruck(true), 4000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [params]);

    return (
        <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/[0.03] blur-[150px] pointer-events-none" />
            <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-0 bg-gradient-to-b from-blue-500/50 to-transparent"
                animate={{ height: "100%" }}
                transition={{ duration: 3, ease: "easeOut" }}
            />

            <div className="relative max-w-lg mx-auto px-6 py-16 flex flex-col items-center">

                {/* ─── SUCCESS ANIMATION ─── */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative mb-8"
                >
                    {/* Outer ring pulse */}
                    <motion.div
                        className="absolute inset-0 w-24 h-24 rounded-full border border-blue-500/20"
                        animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
                        transition={{ duration: 2, repeat: 2, ease: "easeOut" }}
                    />
                    <motion.div
                        className="absolute inset-0 w-24 h-24 rounded-full border border-blue-500/10"
                        animate={{ scale: [1, 2, 2], opacity: [0.3, 0, 0] }}
                        transition={{ duration: 2, repeat: 2, ease: "easeOut", delay: 0.3 }}
                    />
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.3)]">
                        <svg className="w-12 h-12 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <motion.path
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            />
                        </svg>
                    </div>
                </motion.div>

                {/* ─── HEADING ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mb-10"
                >
                    <motion.p
                        className="text-xs text-blue-400/80 uppercase tracking-[0.4em] font-bold mb-3"
                        initial={{ letterSpacing: "0.1em" }}
                        animate={{ letterSpacing: "0.4em" }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        Bestellung bestätigt
                    </motion.p>
                    <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-outfit)] font-bold text-white mb-4">
                        Vielen Dank!
                    </h1>
                    <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                        Deine Bestellung wurde erfolgreich aufgenommen.<br />
                        Du erhältst eine Bestätigung per E-Mail.
                    </p>
                </motion.div>

                {/* ─── PACKAGING ANIMATION ─── */}
                <PackagingAnimation />

                {/* ─── ORDER DETAILS CARD ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 mb-6 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-4 pb-5 border-b border-white/8 mb-5">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex-shrink-0">
                            <img src="/Produktbilder/Produktbild.png" className="w-full h-full object-cover opacity-70" alt="Schwerelos" />
                        </div>
                        <div>
                            <p className="font-[family-name:var(--font-outfit)] font-bold text-white">Schwerelos</p>
                            <p className="text-xs text-white/40 mt-0.5">Edition 01 · 1 Stück</p>
                        </div>
                        <p className="text-sm font-bold text-white/70 ml-auto">33,99 €</p>
                    </div>
                    <div className="space-y-3">
                        <InfoRow label="Bestellnummer" value={orderId} mono />
                        {rechnungsNr && <InfoRow label="Rechnungsnr. (Stripe)" value={rechnungsNr} mono />}
                        <InfoRow label="Sendungsnummer" value={trackingNr} mono />
                        <InfoRow label="Voraussichtliche Lieferung" value={deliveryDate} />
                        <InfoRow label="Versandart" value="DHL Express" />
                        <InfoRow label="Status" value="In Vorbereitung" badge />
                    </div>
                </motion.div>

                {/* ─── TRACKING LINK ─── */}
                {trackingNr && (
                    <motion.a
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.3 }}
                        href={`https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${trackingNr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors mb-8 group"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        <span className="group-hover:underline">Sendung bei DHL verfolgen</span>
                    </motion.a>
                )}

                {/* ─── TIMELINE: NEXT STEPS ─── */}
                <AnimatePresence>
                    {showTimeline && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full mb-8"
                        >
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] text-white/25 uppercase tracking-[0.3em] font-bold mb-6 text-center"
                            >
                                Nächste Schritte
                            </motion.p>

                            <TimelineStep
                                icon={<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                title="Bestellung bestätigt"
                                subtitle="Deine Zahlung wurde erfolgreich verarbeitet"
                                delay={0.1}
                                isActive
                            />
                            <TimelineStep
                                icon={<svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" /></svg>}
                                title="Wird verpackt"
                                subtitle="Dein Schwerelos wird sorgfältig verpackt"
                                delay={0.4}
                            />
                            <TimelineStep
                                icon={<svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>}
                                title="Auf dem Weg"
                                subtitle="DHL Express holt dein Paket ab"
                                delay={0.7}
                            />
                            <TimelineStep
                                icon={<svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>}
                                title="Zugestellt"
                                subtitle={`Voraussichtlich am ${deliveryDate}`}
                                delay={1}
                                isLast
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── DELIVERY TRUCK ANIMATION ─── */}
                <AnimatePresence>
                    {showTruck && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full"
                        >
                            <DeliveryTruck />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── RETURNS INFO ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="w-full p-5 rounded-2xl bg-white/[0.02] border border-white/8 mb-6"
                >
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-white/30 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                        <div>
                            <p className="text-xs text-white/50 font-bold mb-1">Widerrufsrecht & Retoure</p>
                            <p className="text-[11px] text-white/30 leading-relaxed">
                                Du hast 14 Tage Widerrufsrecht. Sende einfach eine E-Mail an{" "}
                                <a href="mailto:hallo@nfd.studio" className="text-blue-400 hover:underline">hallo@nfd.studio</a>{" "}
                                mit deiner Bestellnummer. Wir kümmern uns um den Rest.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ─── NOTE ─── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                    className="w-full p-4 rounded-2xl border border-blue-500/15 bg-blue-500/5 mb-10"
                >
                    <p className="text-xs text-blue-300/70 text-center leading-relaxed">
                        <strong>Hinweis:</strong> Es wurden 0,50 € berechnet (Demo). Keine echte Ware wird versendet.
                        Bei Fragen: <span className="text-blue-400">hallo@nfd.studio</span>
                    </p>
                </motion.div>

                {/* ─── BACK BUTTON ─── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all text-sm shadow-[0_0_30px_rgba(255,255,255,0.08)] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <svg className="w-4 h-4 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span className="relative">Zurück zur Website</span>
                    </Link>
                </motion.div>

                {/* ─── BRANDING ─── */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="mt-16 text-[10px] text-white/10 uppercase tracking-widest"
                >
                    NFD Niklas Fiedler Design · nfd.studio
                </motion.p>
            </div>
        </div>
    );
}

/* ─── INFO ROW ─── */
function InfoRow({ label, value, mono, badge }: { label: string; value: string; mono?: boolean; badge?: boolean }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-xs text-white/35 shrink-0">{label}</span>
            {badge ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium animate-pulse">
                    {value}
                </span>
            ) : (
                <span className={`text-xs text-right text-white/70 break-all ${mono ? "font-mono tracking-tight" : ""}`}>
                    {value}
                </span>
            )}
        </div>
    );
}

/* ─── PAGE EXPORT ─── */
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
