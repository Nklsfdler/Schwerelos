"use client";
import { motion } from "framer-motion";

export function SectionSeparator() {
    return (
        <div className="w-full relative py-12 flex flex-col items-center justify-center pointer-events-none z-40 gap-8">
            {/* Top Line - Consistent Strong Blue across full width */}
            <div className="relative w-full h-[2px]">
                <div className="absolute inset-0 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
            </div>

            {/* Bottom Glow - Consistent & Subtle */}
            <div className="relative w-full h-px opacity-30">
                <div className="absolute inset-0 bg-blue-400" />
            </div>
        </div>
    );
}
