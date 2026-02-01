"use client";
import { motion } from "framer-motion";

export function SectionSeparator() {
    return (
        <div className="w-full relative py-24 flex items-center justify-center pointer-events-none z-40">
            {/* Light Horizon: A subtle, weightless line floating in space */}
            <div className="relative w-full max-w-[60vw] h-px">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
        </div>
    );
}
