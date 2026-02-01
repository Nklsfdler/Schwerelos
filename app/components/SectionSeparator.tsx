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
                className="w-[100vw] h-[40vh] bg-blue-600/20 blur-[120px] rounded-[100%] mix-blend-screen pointer-events-none absolute"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.1) 40%, transparent 70%)"
                }}
            />
        </div>
    );
}
