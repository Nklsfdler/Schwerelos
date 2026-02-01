"use client";
import { motion } from "framer-motion";

export function SectionSeparator() {
    return (
        <div className="w-full relative py-12 flex flex-col items-center justify-center pointer-events-none z-40 gap-8">
            {/* Top Line - Dark Expensive Modern Blue (Sapphire/Cobalt) */}
            <div className="relative w-full h-[2px]">
                <div className="absolute inset-0 bg-[#0F52BA] shadow-[0_0_25px_rgba(15,82,186,0.5)]" />
            </div>

            {/* Bottom Glow - Deep & Rich */}
            <div className="relative w-full h-px opacity-40">
                <div className="absolute inset-0 bg-[#0a3d8f]" />
            </div>
        </div>
    );
}
