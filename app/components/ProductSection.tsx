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
        <section id="shop" className="relative w-full min-h-screen bg-[#020205] border-t border-white/20 text-white py-32 px-4 md:px-12 flex flex-col items-center z-30 shadow-[0_-50px_100px_rgba(0,0,0,1)]">

            {/* Subtle Color Glow for Separation */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent shadow-[0_0_50px_rgba(59,130,246,0.3)]" />

            <div className="max-w-[1400px] w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">

                {/* DETAILS (Now First) */}
                <div className="flex flex-col justify-center h-full order-1">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] uppercase tracking-[0.2em] text-blue-200">
                                Unikat-Serie
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                                20 / 50 Verfügbar
                            </span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-[family-name:var(--font-outfit)] font-bold mb-4 leading-none text-white">
                            Schwerelos
                        </h2>
                        <p className="text-3xl font-[family-name:var(--font-dm)] font-light text-white/90 mb-8 flex items-baseline gap-2">
                            159,00 €
                        </p>

                        <div className="space-y-6 border-t border-white/10 py-8 mb-8 text-sm font-[family-name:var(--font-dm)] text-white/60">
                            <div className="flex justify-between">
                                <span>Material</span>
                                <span className="text-white font-medium">Massiver Obsidian & Vulkanstein</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Maße</span>
                                <span className="text-white">45cm x 15cm x 15cm</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Gewicht</span>
                                <span className="text-white">2.4 kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Versand</span>
                                <span className="text-white">DHL Express (Inklusive)</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Lieferzeit</span>
                                <span className="text-white">1-2 Werktage</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={openCart}
                                className="group w-full py-5 bg-white text-black font-[family-name:var(--font-outfit)] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-neutral-200 transition-all flex items-center justify-center gap-3"
                            >
                                In den Warenkorb
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="text-center text-[10px] uppercase tracking-widest text-white/30 pt-4">
                                14 TAGE RÜCKGABERECHT • SICHERE BEZAHLUNG
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* GALLERY (Now Second) */}
                <div className="flex flex-col gap-6 order-2">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A0A0E]"
                    >
                        <img
                            src={IMAGES[currentImage]}
                            alt="Schwerelos Sculpture View"
                            className="absolute inset-0 w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </motion.div>

                    <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                        {IMAGES.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentImage(i)}
                                className={`
                                    relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border transition-all duration-300
                                    ${currentImage === i ? "border-white opacity-100 ring-2 ring-white/20" : "border-white/10 opacity-50 hover:opacity-80"}
                                `}
                            >
                                <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
