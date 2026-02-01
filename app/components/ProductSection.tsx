"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../context/CartContext";
import { Plus, ArrowRight, Check } from "lucide-react";

const IMAGES = [
    "/Produktbilder/Produktbild.png",   // Main Product Image
    "/Produktbilder/im Museum.png",     // Context: Museum
    "/Produktbilder/im Wohnzimmer.png"  // Context: Living Room
];

export default function ProductSection() {
    const { openCart } = useCart();
    const [currentImage, setCurrentImage] = useState(0);

    return (
        <section id="shop" className="relative w-full min-h-screen bg-[#020205] border-t border-white/5 text-white py-32 px-4 md:px-12 flex flex-col items-center justify-center z-30">

            {/* Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.1),transparent_70%)] pointer-events-none" />

            {/* SHOPPING CARD CONTAINER */}
            <div className="relative max-w-[1200px] w-full bg-[#080808] border border-white/10 rounded-[3rem] p-8 md:p-16 overflow-hidden shadow-2xl">

                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

                    {/* 1. GALLERY (Images First/Top) */}
                    <div className="flex flex-col gap-6 w-full">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1 }}
                            className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-[#050505] shadow-inner"
                        >
                            <img
                                src={IMAGES[currentImage]}
                                alt="Schwerelos Sculpture View"
                                className="absolute inset-0 w-full h-full object-cover opacity-100 transform hover:scale-105 transition-transform duration-700"
                            />
                        </motion.div>

                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide justify-center md:justify-start">
                            {IMAGES.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentImage(i)}
                                    className={`
                                    relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border transition-all duration-300
                                    ${currentImage === i ? "border-white opacity-100 ring-2 ring-white/20 scale-105" : "border-white/10 opacity-60 hover:opacity-100"}
                                `}
                                >
                                    <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. DETAILS (Bottom/Right) */}
                    <div className="flex flex-col justify-center h-full">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <span className="px-4 py-1.5 bg-white text-black font-bold rounded-full text-[10px] uppercase tracking-[0.15em]">
                                    Limited Edition
                                </span>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    Verfügbar
                                </span>
                            </div>

                            <h2 className="text-5xl md:text-7xl font-[family-name:var(--font-outfit)] font-black mb-6 leading-none text-white tracking-tight">
                                Schwerelos
                            </h2>

                            <div className="flex items-baseline gap-4 mb-10 border-b border-white/10 pb-8">
                                <p className="text-4xl font-[family-name:var(--font-dm)] font-light text-white">
                                    159,00 €
                                </p>
                                <span className="text-sm text-white/40 uppercase tracking-widest">Inkl. Mwst. & Versand</span>
                            </div>

                            <div className="space-y-4 mb-10">
                                <InfoRow label="Material" value="Obsidian & Vulkanstein" />
                                <InfoRow label="Maße" value="45cm x 15cm x 15cm" />
                                <InfoRow label="Limitierung" value="50 Exemplare weltweit" />
                                <InfoRow label="Lieferung" value="Express (1-2 Tage)" />
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={openCart}
                                    className="group w-full py-6 bg-white text-black font-[family-name:var(--font-outfit)] uppercase tracking-[0.2em] font-bold text-sm rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:-translate-y-1"
                                >
                                    In den Warenkorb
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <div className="flex justify-center gap-6 mt-4 opacity-50 text-[10px] uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> Kostenloser Versand</span>
                                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3" /> 30 Tage Rückgabe</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-lg transition-colors">
            <span className="text-sm text-white/40 font-[family-name:var(--font-dm)] uppercase tracking-wider">{label}</span>
            <span className="text-sm text-white/90 font-medium font-[family-name:var(--font-dm)]">{value}</span>
        </div>
    );
}
