"use client";
import { motion } from "framer-motion";

export function SectionSeparator() {
    return (
        <div className="w-full relative h-[60vh] -my-[30vh] z-50 pointer-events-none flex items-center justify-center overflow-visible">
            {/* Massive Ambient Fog Layer - Seamless Integration */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ margin: "-20%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="w-[120vw] h-[60vh] bg-blue-900/10 blur-[150px] rounded-[100%] mix-blend-screen pointer-events-none absolute"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, rgba(30, 64, 175, 0.05) 40%, transparent 65%)"
                }}
            />
        </div>
    );
}
