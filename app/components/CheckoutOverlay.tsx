"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { X, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import nextDynamic from 'next/dynamic';

const StripeCheckout = nextDynamic(() => import('./StripeCheckout'), { ssr: false });

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
                                <img src="/Produktbilder/Produktbild.png" className="w-full h-full object-cover opacity-80" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-[family-name:var(--font-outfit)] font-bold text-lg">Schwerelos</h3>
                                    <p className="text-xs text-white/50 font-[family-name:var(--font-dm)]">Edition 01 / Edelstahl</p>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-sm font-light">1 x</p>
                                    <p className="font-bold">33,99 €</p>
                                </div>
                            </div>
                        </div>

                        {/* Service badges */}
                        <div className="grid grid-cols-3 gap-2 mb-6">
                            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <Truck className="w-4 h-4 text-blue-400/60" />
                                <span className="text-[9px] text-white/30 text-center leading-tight">Kostenloser Versand</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <RotateCcw className="w-4 h-4 text-blue-400/60" />
                                <span className="text-[9px] text-white/30 text-center leading-tight">14 Tage Widerrufsrecht</span>
                            </div>
                            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                <ShieldCheck className="w-4 h-4 text-blue-400/60" />
                                <span className="text-[9px] text-white/30 text-center leading-tight">Sicher bezahlen</span>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="border-t border-white/10 py-6 text-sm space-y-3 font-[family-name:var(--font-dm)]">
                                <div className="flex justify-between text-white/60">
                                    <span>Zwischensumme</span>
                                    <span>29,00 €</span>
                                </div>
                                <div className="flex justify-between text-white/60">
                                    <span>Versand</span>
                                    <span>4,99 €</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-4 border-t border-white/10">
                                    <span>Gesamt</span>
                                    <span>33,99 €</span>
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

export function CheckoutOverlay() {
    const { isCheckoutOpen, closeCheckout } = useCart();

    return (
        <AnimatePresence>
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
                        className="relative w-full max-w-5xl bg-[#09090B] rounded-[24px] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[700px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                    >
                        {/* LEFT: ORDER SUMMARY */}
                        <div className="w-full md:w-1/3 bg-[#050505] p-8 md:p-10 border-r border-white/5 flex flex-col relative hidden md:flex">
                            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-10 font-[family-name:var(--font-outfit)] font-bold">Bestellübersicht</h3>
                            <div className="flex gap-5 items-center mb-8">
                                <div className="w-20 h-20 bg-[#111] rounded-2xl overflow-hidden shadow-sm border border-white/10 p-1">
                                    <img src="/Produktbilder/Produktbild.png" className="w-full h-full object-cover rounded-xl opacity-80" />
                                </div>
                                <div>
                                    <h3 className="font-[family-name:var(--font-outfit)] font-bold text-white text-lg">Schwerelos</h3>
                                    <p className="text-xs text-white/40 font-[family-name:var(--font-dm)] mt-1">Edition 01 / Obsidian</p>
                                    <p className="text-sm font-bold text-white/90 mt-2">33,99 €</p>
                                </div>
                            </div>

                            {/* Return policy & trust */}
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <RotateCcw className="w-4 h-4 text-blue-400/60 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">14 Tage Widerrufsrecht</p>
                                        <p className="text-[9px] text-white/25 mt-0.5">Einfach per E-Mail an hallo@nfd.studio</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                    <Truck className="w-4 h-4 text-blue-400/60 shrink-0" />
                                    <div>
                                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider">DHL Express Versand</p>
                                        <p className="text-[9px] text-white/25 mt-0.5">1–3 Werktage · Tracking per E-Mail</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto space-y-4 text-sm font-[family-name:var(--font-dm)]">
                                <div className="flex justify-between border-t border-white/5 pt-4">
                                    <span className="text-white/40">Zwischensumme</span>
                                    <span className="font-medium text-white/80">29,00 €</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-4">
                                    <span className="text-white/40">Versand</span>
                                    <span className="font-medium text-white/80">4,99 €</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-4 text-lg">
                                    <span className="font-bold text-white">Gesamt</span>
                                    <span className="font-bold text-blue-400">33,99 €</span>
                                </div>
                                <div className="mt-1 text-[10px] text-blue-400/50 text-right">
                                    Demo: Es werden 0,50 € berechnet
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: PAYMENT */}
                        <div className="flex-1 bg-[#09090B] p-6 md:p-10 flex flex-col relative overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-[family-name:var(--font-outfit)] font-bold text-white">Bezahlung</h2>
                                <button
                                    onClick={closeCheckout}
                                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/60" />
                                </button>
                            </div>

                            {/* Demo notice — compact */}
                            <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                                <p className="text-xs text-blue-300/70 leading-relaxed font-[family-name:var(--font-dm)]">
                                    <strong className="text-blue-400">Demo-Modus:</strong> Es werden 0,50 € berechnet. Keine Ware wird versendet. Bestellbestätigung per E-Mail.
                                </p>
                            </div>

                            {/* STRIPE CHECKOUT COMPONENT */}
                            <div className="flex-1">
                                <StripeCheckout amount={50} />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
