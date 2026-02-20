"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { X, ShieldCheck, Undo2 } from "lucide-react";
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

                            {/* Trust badges */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>SSL-Verschlüsselt</span>
                                </div>
                                <div className="w-px h-3 bg-white/10" />
                                <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                                    <Undo2 className="w-3.5 h-3.5" />
                                    <span>14 Tage Rückgabe</span>
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
                        className="relative w-full max-w-5xl bg-[#09090B] rounded-[24px] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[720px] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                    >
                        {/* LEFT: ORDER SUMMARY */}
                        <div className="w-full md:w-[340px] bg-[#050507] p-8 md:p-10 border-r border-white/5 flex flex-col relative hidden md:flex">
                            {/* Subtle grid pattern */}
                            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-10 font-[family-name:var(--font-outfit)] font-bold relative z-10">Bestellübersicht</h3>

                            <div className="flex gap-5 items-center mb-8 relative z-10">
                                <div className="w-20 h-20 bg-[#111] rounded-2xl overflow-hidden shadow-sm border border-white/10 p-1">
                                    <img src="/Produktbilder/Produktbild.png" className="w-full h-full object-cover rounded-xl opacity-80" />
                                </div>
                                <div>
                                    <h3 className="font-[family-name:var(--font-outfit)] font-bold text-white text-lg">Schwerelos</h3>
                                    <p className="text-xs text-white/40 font-[family-name:var(--font-dm)] mt-1">Edition 01 / Obsidian</p>
                                    <p className="text-sm font-bold text-white/90 mt-2">33,99 €</p>
                                </div>
                            </div>

                            <div className="mt-auto space-y-3 text-sm font-[family-name:var(--font-dm)] relative z-10">
                                <div className="flex justify-between border-t border-white/5 pt-4">
                                    <span className="text-white/40">Zwischensumme</span>
                                    <span className="font-medium text-white/80">29,00 €</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/40">Versand</span>
                                    <span className="font-medium text-white/80">4,99 €</span>
                                </div>
                                <div className="flex justify-between border-t border-white/10 pt-4 text-lg">
                                    <span className="font-bold text-white">Gesamt</span>
                                    <span className="font-bold text-blue-400">33,99 €</span>
                                </div>
                                <div className="mt-2 text-[10px] text-blue-400/40 text-right">
                                    Demo · Es werden 0,50 € berechnet
                                </div>
                            </div>

                            {/* Trust & Returns info */}
                            <div className="mt-6 pt-4 border-t border-white/5 space-y-2 relative z-10">
                                <div className="flex items-center gap-2 text-[10px] text-white/25">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>256-Bit SSL · Stripe gesichert</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-white/25">
                                    <Undo2 className="w-3 h-3" />
                                    <span>14 Tage kostenlose Rückgabe</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: PAYMENT */}
                        <div className="flex-1 bg-[#09090B] p-6 md:p-10 flex flex-col relative overflow-y-auto">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-[family-name:var(--font-outfit)] font-bold text-white">Bezahlung</h2>
                                    <p className="text-xs text-white/30 mt-1">Wähle deine Zahlungsmethode</p>
                                </div>
                                <button
                                    onClick={closeCheckout}
                                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5 text-white/60" />
                                </button>
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
