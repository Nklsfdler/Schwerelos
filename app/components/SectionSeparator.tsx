"use client";
import { motion } from "framer-motion";

export function SectionSeparator() {
    return (
        <div className="w-full relative h-[40vh] -my-[20vh] z-40 pointer-events-none flex items-center justify-center overflow-visible">
            {/* Soft, Instant, Centered Blue Glow */}
            <div
                className="w-[120vw] h-[30vh] bg-blue-500/20 blur-[100px] rounded-[100%] mix-blend-screen pointer-events-none absolute"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(60, 130, 255, 0.4) 0%, rgba(30, 64, 175, 0.1) 50%, transparent 80%)"
                }}
            />
        </div>
    );
}
