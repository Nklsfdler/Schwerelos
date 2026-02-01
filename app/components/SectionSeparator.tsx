"use client";
import { motion } from "framer-motion";

export function SectionSeparator() {
    return (
        <div className="w-full relative py-12 flex flex-col items-center justify-center pointer-events-none z-40 gap-8">
            {/* Dark Expensive Modern Blue - Deep Base */}
            <div className="relative w-full h-[2px] bg-[#0f172a] overflow-hidden">
                {/* Dynamic Flowing Energy - Subtle Shimmer */}
                <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1e40af] to-transparent opacity-80"
                />

                {/* Static Deep Core */}
                <div className="absolute inset-0 bg-blue-900/50 mix-blend-overlay" />
            </div>

            {/* Subtle Deep Glow */}
            <div className="relative w-full h-px opacity-40">
                <div className="absolute inset-0 bg-blue-900 blur-[2px]" />
            </div>
        </div>
    );
}
