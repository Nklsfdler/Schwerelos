"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

function generateOrderId(): string {
    const prefix = "SCH";
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 900000) + 100000;
    return `${prefix}-${year}-${random}`;
}

function generateTrackingNumber(): string {
    // DHL-style tracking number: JD + 18 digits
    const prefix = "JD";
    const digits = Array.from({ length: 18 }, () => Math.floor(Math.random() * 10)).join("");
    return `${prefix}${digits}`;
}

function getDeliveryEstimate(): string {
    const today = new Date();
    // 5-8 business days
    let daysAdded = 0;
    const targetDays = 5 + Math.floor(Math.random() * 4);
    const date = new Date(today);
    while (daysAdded < targetDays) {
        date.setDate(date.getDate() + 1);
        const day = date.getDay();
        if (day !== 0 && day !== 6) daysAdded++; // skip weekends
    }
    return date.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function ConfirmationContent() {
    const params = useSearchParams();
    const [orderId, setOrderId] = useState("");
    const [trackingNr, setTrackingNr] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");

    useEffect(() => {
        const urlOrder = params.get("order_id");
        const urlTracking = params.get("tracking");
        setOrderId(urlOrder || generateOrderId());
        setTrackingNr(urlTracking || generateTrackingNumber());
        setDeliveryDate(getDeliveryEstimate());
    }, [params]);

    return (
        <div className="min-h-screen bg-[#050507] text-white flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">

            {/* Background glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

            {/* Check animation */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(59,130,246,0.2)]"
            >
                <svg className="w-10 h-10 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    />
                </svg>
            </motion.div>

            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-12"
            >
                <p className="text-xs text-blue-400/80 uppercase tracking-[0.3em] font-bold mb-3">
                    Bestellung bestätigt
                </p>
                <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-outfit)] font-bold text-white mb-4">
                    Vielen Dank.
                </h1>
                <p className="text-white/40 text-sm max-w-sm mx-auto leading-relaxed">
                    Deine Bestellung wurde erfolgreich aufgenommen.<br />
                    Eine Bestätigung wird separat zugestellt.
                </p>
            </motion.div>

            {/* Order Details Card */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-3xl p-8 mb-8 backdrop-blur-sm"
            >
                {/* Product row */}
                <div className="flex items-center gap-4 pb-6 border-b border-white/8 mb-6">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl border border-white/10 overflow-hidden flex-shrink-0">
                        <img src="/Produktbilder/Produktbild.png" className="w-full h-full object-cover opacity-70" alt="Schwerelos" />
                    </div>
                    <div>
                        <p className="font-[family-name:var(--font-outfit)] font-bold text-white">Schwerelos</p>
                        <p className="text-xs text-white/40 mt-0.5">Edition 01 / Obsidian · 1 Stück</p>
                        <p className="text-sm font-bold text-white/70 mt-1">33,99 €</p>
                    </div>
                </div>

                {/* Order Info rows */}
                <div className="space-y-4">
                    <InfoRow label="Bestellnummer" value={orderId} mono />
                    <InfoRow label="Sendungsverfolgung" value={trackingNr} mono />
                    <InfoRow label="Voraussichtliche Lieferung" value={deliveryDate} />
                    <InfoRow label="Versandart" value="DHL Express" />
                    <InfoRow label="Status" value="In Vorbereitung" badge />
                </div>
            </motion.div>

            {/* DHL Tracking link */}
            {trackingNr && (
                <motion.a
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
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

            {/* Info note */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-full max-w-md p-4 rounded-2xl border border-blue-500/15 bg-blue-500/5 mb-10"
            >
                <p className="text-xs text-blue-300/70 text-center leading-relaxed">
                    <strong>Hinweis:</strong> Dies ist eine Testbestellung (Stripe Test-Modus). Es wurden 0,50 € technisch verarbeitet. Keine echte Ware wird versendet.
                    Für Rückfragen oder Retouren: <span className="text-blue-400">hallo@nfd.studio</span>
                </p>
            </motion.div>

            {/* Back button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
            >
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-[family-name:var(--font-outfit)] font-bold uppercase tracking-widest rounded-full hover:bg-blue-50 transition-all text-sm shadow-[0_0_30px_rgba(255,255,255,0.08)]"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Zurück zur Website
                </Link>
            </motion.div>

            {/* Small NFD branding */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-16 text-[10px] text-white/15 uppercase tracking-widest"
            >
                NFD Niklas Fiedler Design · nfd.studio
            </motion.p>
        </div>
    );
}

function InfoRow({ label, value, mono, badge }: { label: string; value: string; mono?: boolean; badge?: boolean }) {
    return (
        <div className="flex justify-between items-start gap-4">
            <span className="text-xs text-white/35 shrink-0">{label}</span>
            {badge ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20 font-medium">
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
