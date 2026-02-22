"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
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

/* ─── COMPACT DELIVERY TRUCK SVG ─── */
function DeliveryTruck() {
    return (
        <div className="relative w-full h-24 md:h-28 overflow-hidden my-4">
            {/* Road */}
            <div className="absolute bottom-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <motion.div className="absolute bottom-3.5 left-0 right-0 flex gap-10" animate={{ x: [0, -160] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}>
                {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="w-6 h-[1px] bg-white/8 shrink-0" />
                ))}
            </motion.div>

            {/* Truck */}
            <motion.div
                className="absolute bottom-4"
                initial={{ x: "-80%" }}
                animate={{ x: "35%" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
                <svg width="100" height="56" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="12" width="70" height="42" rx="4" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                    <text x="35" y="38" textAnchor="middle" fontSize="8" fontWeight="bold" fill="rgba(255,255,255,0.2)" fontFamily="sans-serif" letterSpacing="3">
                        NFD
                    </text>
                    <rect x="70" y="27" width="35" height="27" rx="4" fill="rgba(59,130,246,0.12)" stroke="rgba(59,130,246,0.25)" strokeWidth="1" />
                    <rect x="80" y="31" width="20" height="10" rx="2" fill="rgba(59,130,246,0.15)" />
                    <motion.circle cx="20" cy="56" r="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"
                        animate={{ rotate: 360 }} transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }} />
                    <motion.circle cx="90" cy="56" r="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"
                        animate={{ rotate: 360 }} transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }} />
                    <circle cx="20" cy="56" r="2" fill="rgba(255,255,255,0.12)" />
                    <circle cx="90" cy="56" r="2" fill="rgba(255,255,255,0.12)" />
                    {/* Blinking light */}
                    <motion.circle cx="107" cy="32" r="2" fill="rgba(59,130,246,0.6)"
                        animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                </svg>
            </motion.div>
        </div>
    );
}

/* ─── HORIZONTAL STEP ─── */
function HorizontalStep({ icon, title, subtitle, index, isActive, isLast }: {
    icon: React.ReactNode; title: string; subtitle: string; index: number; isActive?: boolean; isLast?: boolean;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            className="flex flex-col items-center text-center flex-1 min-w-0 relative"
        >
            {/* Connector line */}
            {!isLast && (
                <motion.div
                    className="absolute top-5 left-[55%] right-0 h-[1px] bg-gradient-to-r from-white/10 to-white/5 hidden md:block"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.15 * index + 0.2, duration: 0.4 }}
                    style={{ transformOrigin: 'left' }}
                />
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border shrink-0 mb-2 ${isActive
                ? "bg-blue-500/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.25)]"
                : "bg-white/[0.03] border-white/10"
                }`}>
                {icon}
            </div>
            <p className={`text-[11px] md:text-xs font-bold leading-tight ${isActive ? "text-blue-400" : "text-white/40"}`}>{title}</p>
            <p className="text-[9px] md:text-[10px] text-white/20 mt-0.5 leading-tight">{subtitle}</p>
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

    useEffect(() => {
        setOrderId(params.get("order_id") || generateOrderId());
        setTrackingNr(params.get("tracking") || generateTrackingNumber());
        setRechnungsNr(params.get("payment_intent") || params.get("pi") || "");
        setDeliveryDate(getDeliveryEstimate());
    }, [params]);

    return (
        <div className="min-h-screen bg-[#050507] text-white relative overflow-hidden">
            {/* Background glow — subtle, no beam */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/[0.03] blur-[150px] pointer-events-none" />

            <div className="relative max-w-2xl mx-auto px-4 md:px-8 py-16 md:py-24 flex flex-col items-center">

                {/* ─── SUCCESS ANIMATION ─── */}
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="relative mb-5"
                >
                    <motion.div
                        className="absolute inset-0 w-20 h-20 rounded-full border border-blue-500/20"
                        animate={{ scale: [1, 1.4, 1.4], opacity: [0.5, 0, 0] }}
                        transition={{ duration: 1.5, repeat: 1, ease: "easeOut" }}
                    />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.2)]">
                        <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <motion.path
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                            />
                        </svg>
                    </div>
                </motion.div>

                {/* ─── HEADING ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-8 w-full"
                >
                    <motion.p
                        className="text-[10px] md:text-xs text-blue-400/80 uppercase tracking-[0.3em] font-bold mb-3"
                        initial={{ letterSpacing: "0.1em" }}
                        animate={{ letterSpacing: "0.3em" }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Bestellung bestätigt
                    </motion.p>
                    <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-outfit)] font-black text-white mb-4 tracking-tight drop-shadow-xl">
                        Vielen Dank!
                    </h1>
                    <p className="text-white/50 text-base md:text-lg max-w-md mx-auto leading-relaxed mb-6">
                        Deine Bestellung wurde erfolgreich aufgenommen. Du erhältst in Kürze eine Bestätigung per E-Mail.
                    </p>

                    {/* PROMINENT ORDER ID BADGE */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3 shadow-[0_0_30px_rgba(255,255,255,0.02)] backdrop-blur-md"
                    >
                        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Bestellnr.</span>
                        <span className="text-lg md:text-xl font-[family-name:var(--font-dm)] text-white tracking-widest">{orderId}</span>
                        <button
                            onClick={() => navigator.clipboard.writeText(orderId)}
                            className="ml-2 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors group"
                            title="Kopieren"
                        >
                            <svg className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </motion.div>
                </motion.div>

                {/* ─── TRUCK ANIMATION (loads immediately, no delay) ─── */}
                <DeliveryTruck />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 mb-8 backdrop-blur-sm shadow-2xl"
                >
                    <div className="flex items-center gap-4 pb-6 border-b border-white/8 mb-6">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex-shrink-0">
                            <img src="/Produktbilder/Produktbild.png" className="w-full h-full object-cover opacity-70" alt="Schwerelos" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-[family-name:var(--font-outfit)] font-black text-white text-lg">Schwerelos</p>
                            <p className="text-xs text-white/50 mt-1 uppercase tracking-widest font-bold">Edition 01 · 1 Stück</p>
                        </div>
                        <p className="text-xl font-bold text-white ml-auto shrink-0">33,99 €</p>
                    </div>
                    <div className="space-y-4">
                        <InfoRow label="Bestellnummer" value={orderId} mono />
                        {rechnungsNr && <InfoRow label="Rechnungsnr." value={rechnungsNr} mono />}
                        <InfoRow label="Sendungsnummer" value={trackingNr} mono />
                        <InfoRow label="Voraussichtliche Lieferung" value={deliveryDate} />
                        <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3 mt-1">
                            <span className="text-sm text-white/50">Versandart</span>
                            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">DHL Express</span>
                            </div>
                        </div>
                        <InfoRow label="Status" value="Zahlung erhalten" badge />
                    </div>
                </motion.div>

                {/* ─── TRACKING LINK ─── */}
                {trackingNr && (
                    <motion.a
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        href={`https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${trackingNr}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors mb-6 group"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                        <span className="group-hover:underline">Sendung bei DHL verfolgen</span>
                    </motion.a>
                )}

                {/* ─── HORIZONTAL STEPS: NEXT STEPS ─── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="w-full mb-10"
                >
                    <p className="text-xs text-white/30 uppercase tracking-[0.25em] font-bold mb-6 text-center">
                        Nächste Schritte
                    </p>
                    <div className="flex items-start justify-between gap-2 md:gap-4 px-2">
                        <HorizontalStep
                            icon={<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                            title="Zahlung"
                            subtitle="Erhalten"
                            index={0}
                            isActive
                        />
                        <HorizontalStep
                            icon={<svg className="w-4 h-4 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" /></svg>}
                            title="Verpackung"
                            subtitle="In Kürze"
                            index={1}
                        />
                        <HorizontalStep
                            icon={<svg className="w-4 h-4 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>}
                            title="Versand"
                            subtitle="DHL Express"
                            index={2}
                        />
                        <HorizontalStep
                            icon={<svg className="w-4 h-4 text-white/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>}
                            title="Zugestellt"
                            subtitle={deliveryDate.split(',')[1]?.trim() || "Bald"}
                            index={3}
                            isLast
                        />
                    </div>
                </motion.div>

                {/* ─── RETURNS INFO + RETOURE BUTTON ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="w-full p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/8 mb-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-white/5 rounded-full mt-0.5">
                            <svg className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-white/70 font-bold mb-1">Widerrufsrecht & Retoure</p>
                            <p className="text-xs text-white/40 leading-relaxed max-w-sm">
                                14 Tage Widerrufsrecht. E-Mail an{" "}
                                <a href="mailto:hallo@nfd.studio" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">hallo@nfd.studio</a>{" "}
                                mit deiner Bestellnummer.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ─── DEMO NOTE ─── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="w-full p-3 rounded-xl border border-blue-500/15 bg-blue-500/5 mb-6"
                >
                    <p className="text-[10px] text-blue-300/70 text-center leading-relaxed">
                        <strong>Hinweis:</strong> Es wurden 0,50 € berechnet (Demo). Keine echte Ware wird versendet.
                        Bei Fragen: <span className="text-blue-400">hallo@nfd.studio</span>
                    </p>
                </motion.div>

                {/* ─── ACTION BUTTONS ─── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="w-full flex flex-col sm:flex-row gap-3 mb-6"
                >
                    <Link
                        href="/"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all text-xs shadow-[0_0_25px_rgba(255,255,255,0.06)] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                        <svg className="w-3.5 h-3.5 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span className="relative">Zurück zur Website</span>
                    </Link>
                    <Link
                        href="/retoure"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.04] border border-white/10 text-white/70 font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-white/[0.08] hover:border-blue-500/30 hover:text-white transition-all text-xs"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                        <span>Retoure & Status</span>
                    </Link>
                </motion.div>

                {/* ─── BRANDING ─── */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                    className="mt-8 text-[9px] text-white/10 uppercase tracking-widest"
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
        <div className="flex justify-between items-center gap-4 py-1.5">
            <span className="text-sm text-white/50 whitespace-nowrap">{label}</span>
            <div className="text-right">
                {badge ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                        {value}
                    </span>
                ) : (
                    <span className={`text-sm ${mono ? 'font-[family-name:var(--font-dm)] text-white/80' : 'text-white font-medium'}`}>
                        {value}
                    </span>
                )}
            </div>
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
