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
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/[0.02] blur-[120px] pointer-events-none" />

            <div className="relative max-w-xl mx-auto px-4 md:px-6 py-10 md:py-14 flex flex-col items-center">

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
                    className="text-center mb-6"
                >
                    <motion.p
                        className="text-[10px] text-blue-400/80 uppercase tracking-[0.3em] font-bold mb-2"
                        initial={{ letterSpacing: "0.1em" }}
                        animate={{ letterSpacing: "0.3em" }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Bestellung bestätigt
                    </motion.p>
                    <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-outfit)] font-bold text-white mb-2">
                        Vielen Dank!
                    </h1>
                    <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                        Deine Bestellung wurde erfolgreich aufgenommen. Du erhältst eine Bestätigung per E-Mail.
                    </p>
                </motion.div>

                {/* ─── TRUCK ANIMATION (loads immediately, no delay) ─── */}
                <DeliveryTruck />

                {/* ─── ORDER DETAILS CARD ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 md:p-5 mb-4 backdrop-blur-sm"
                >
                    <div className="flex items-center gap-3 pb-4 border-b border-white/8 mb-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex-shrink-0">
                            <img src="/Produktbilder/Produktbild.png" className="w-full h-full object-cover opacity-70" alt="Schwerelos" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-[family-name:var(--font-outfit)] font-bold text-white text-sm">Schwerelos</p>
                            <p className="text-[10px] text-white/40 mt-0.5">Edition 01 · 1 Stück</p>
                        </div>
                        <p className="text-sm font-bold text-white/70 ml-auto shrink-0">33,99 €</p>
                    </div>
                    <div className="space-y-2.5">
                        <InfoRow label="Bestellnummer" value={orderId} mono />
                        {rechnungsNr && <InfoRow label="Rechnungsnr." value={rechnungsNr} mono />}
                        <InfoRow label="Sendungsnummer" value={trackingNr} mono />
                        <InfoRow label="Voraussichtliche Lieferung" value={deliveryDate} />
                        <div className="flex justify-between items-center py-0.5">
                            <span className="text-[10px] text-white/35">Versandart</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                <span className="text-[10px] text-white/70">DHL Express</span>
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
                    className="w-full mb-6"
                >
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.25em] font-bold mb-4 text-center">
                        Nächste Schritte
                    </p>
                    <div className="flex items-start gap-1 md:gap-3">
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
                    className="w-full p-4 rounded-xl bg-white/[0.02] border border-white/8 mb-4"
                >
                    <div className="flex items-start gap-3">
                        <svg className="w-4 h-4 text-white/25 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                        <div className="min-w-0">
                            <p className="text-[11px] text-white/50 font-bold mb-0.5">Widerrufsrecht & Retoure</p>
                            <p className="text-[10px] text-white/30 leading-relaxed">
                                14 Tage Widerrufsrecht. E-Mail an{" "}
                                <a href="mailto:hallo@nfd.studio" className="text-blue-400 hover:underline">hallo@nfd.studio</a>{" "}
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
        <div className="flex justify-between items-start gap-4">
            <span className="text-[10px] text-white/35 shrink-0">{label}</span>
            {badge ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium animate-pulse">
                    {value}
                </span>
            ) : (
                <span className={`text-[10px] text-right text-white/70 break-all ${mono ? "font-mono tracking-tight" : ""}`}>
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
