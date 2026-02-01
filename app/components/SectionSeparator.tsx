"use client";
import { motion } from "framer-motion";

export function SectionSeparator() {
    return (
        <div className="w-full relative py-12 flex flex-col items-center justify-center pointer-events-none z-40 gap-8">
            {/* Top Line - Higher & Stronger Blue */}
            <div className="relative w-full h-[2px]">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_20px_rgba(59,130,246,0.8)]" />
            </div>

            {/* Bottom Glow - Subtle */}
            <div className="relative w-full h-px opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            </div>
        </div>
    );
}
