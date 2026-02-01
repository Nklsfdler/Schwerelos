"use client";
import { motion } from "framer-motion";

export function SectionSeparator() {
    return (
        <div className="w-full relative h-[40vh] -my-[20vh] z-40 pointer-events-none flex items-center justify-center overflow-hidden">
            {/* Minimalist "Starlight" Horizon - Elegant & Weightless */}
            <div className="relative w-full h-full flex items-center justify-center">
                {/* 1. The Void Line (Subtle Distortion) */}
                <div className="w-full h-px bg-white/5 shadow-[0_0_50px_rgba(255,255,255,0.1)]" />

                {/* 2. Floating Dust Motes (Animated) */}
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    whileInView={{ opacity: 1, x: 100 }}
                    transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                    className="absolute w-1 h-1 bg-white/40 rounded-full blur-[1px] shadow-[0_0_10px_white]"
                />
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 0.5, x: -50 }}
                    transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay: 1 }}
                    className="absolute w-0.5 h-0.5 bg-white/20 rounded-full blur-[0.5px]"
                />
            </div>
        </div>
    );
}
