"use client";
import { motion } from "framer-motion";

export function SectionSeparator() {
    return (
        {/* Core Bright Line (for that 'Cool' tech feel) */ }
        < motion.div
                initial = {{ opacity: 0, width: "0%" }
}
whileInView = {{ opacity: 1, width: "60%" }}
transition = {{ duration: 0.6, delay: 0.1, ease: "circOut" }}
className = "h-[2px] bg-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,1)] absolute mix-blend-screen"
    />
        </div >
    );
}
