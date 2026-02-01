"use client";
import { motion } from "framer-motion";

export function SectionSeparator() {
    return (
        <div className="w-full relative h-[40vh] -my-[20vh] z-40 pointer-events-none flex items-center justify-center overflow-visible">
            {/* Cinematic Horizontal Flare (Anamorphic Look) */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0.2 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ margin: "-10%" }}
                transition={{ duration: 0.8, ease: "easeOut" }} // FASTER & COOLER
                className="w-[150vw] h-[20vh] bg-blue-500/30 blur-[80px] rounded-[100%] mix-blend-screen pointer-events-none absolute"
                style={{
                    // STRONGER & HORIZONTAL
                    background: "radial-gradient(ellipse at center, rgba(60, 130, 255, 0.8) 0%, rgba(30, 64, 175, 0.2) 30%, transparent 70%)"
                }}
            />

            {/* Core Bright Line (for that 'Cool' tech feel) */}
            <motion.div
                initial={{ opacity: 0, width: "0%" }}
                whileInView={{ opacity: 1, width: "60%" }}
                transition={{ duration: 0.6, delay: 0.1, ease: "circOut" }}
                className="h-[2px] bg-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,1)] absolute mix-blend-screen"
            />
        </div>
    );
}
