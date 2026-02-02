"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": any;
        }
    }
}

// ORDER: Bottom to Top (Reversed)
const DATA = [
    {
        title: "01. Dynamischer Ursprung",
        text: "Hier beginnt alles. Aus der starren Basis erwächst die Bewegung, Masse transformiert sich in reinen Auftrieb.",
        orbit: "20deg 90deg 30%",
        target: "0m -23.5m 0m",
        fov: "20deg"
    },
    {
        title: "02. Vertikaler Stab",
        text: "Die Achse der Balance. Kein massives Element, sondern ein filigraner Leitstrahl, der den Blick unaufhaltsam in die Höhe zieht.",
        orbit: "-30deg 75deg 35%",  // KEEP ZOOM
        target: "0m -10.0m 0m",
        fov: "20deg"
    },
    {
        title: "03. Negativer Raum",
        text: "Die Kunst der Auslassung. Luft wird zur Materie, Leere wird zur Form. Das Nichts hält die Struktur zusammen.",
        orbit: "120deg 60deg 120%", // CALIBRATED
        target: "0.1m 1.2m 0m",
        fov: "30deg"
    },
    {
        title: "04. Fragile Verbindung",
        text: "Ein Dialog zwischen Innen und Außen. Zwei Helices tanzen umeinander, berühren sich fast, und bleiben doch ewig getrennt.",
        orbit: "200deg 60deg 90%",  // Camera moved up/back to show tip
        target: "-0.1m 4.0m 0m",
        fov: "30deg"
    },
    {
        title: "05. Auslaufen",
        text: "Die Auflösung ins Unendliche. Die Form verliert ihre Grenzen, wird immer feiner, bis sie schließlich eins mit dem Raum wird.",
        orbit: "0deg 30deg 130%",   // CALIBRATED
        target: "0m 3.5m 0m",
        fov: "30deg"
    }
];

// INITIAL STATE (No selection)
const INITIAL_STATE = {
    title: "Schwerelos",
    text: "Eine Studie der Leichtigkeit. Wähle einen Bereich, um die Details zu erkunden.",
    // INITIAL ORBIT: Must match the hardcoded prop in model-viewer to prevent jump
    orbit: "45deg 75deg 160%",
    target: "0m 1.5m 0m",
    fov: "auto"
};

export default function ModelSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const modelViewerRef = React.useRef<any>(null);

    const currentData = activeIndex !== null ? DATA[activeIndex] : INITIAL_STATE;

    // FORCE UPDATE: Ensure model-viewer reacts to changes immediately
    React.useEffect(() => {
        if (modelViewerRef.current) {
            const viewer = modelViewerRef.current;
            viewer.cameraTarget = currentData.target;
            viewer.cameraOrbit = currentData.orbit;
            viewer.fieldOfView = currentData.fov;
        }
    }, [currentData]);

    return (
        <section className="relative w-full min-h-screen md:h-screen bg-[#050505] flex flex-col items-center justify-center snap-section py-2 px-2 md:px-0">

            {/* SEPARATE CARD CONTAINER */}
            <div className="relative w-full max-w-[1400px] h-[90vh] md:h-[95vh] bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">

                {/* Background Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/10 via-[#0a0a0a] to-[#050505] pointer-events-none" />

                {/* 1. TOP: STATIC HEADER (Badge Only) */}
                <div className="relative z-30 w-full p-0 flex flex-col items-start bg-gradient-to-b from-[#0a0a0a] to-transparent shrink-0">
                    <span className="text-xl md:text-2xl text-blue-100 font-[family-name:var(--font-outfit)] font-bold block mb-2 border border-blue-900/50 px-6 py-2 rounded-full bg-blue-950/60 backdrop-blur-md shadow-lg shadow-blue-900/20">
                        Interactive 3D Model
                    </span>
                </div>

                {/* 2. MIDDLE: MODEL VIEWER (FLEX GROW) */}
                <div className="relative z-10 w-full flex-grow cursor-grab active:cursor-grabbing min-h-0">
                    {/* Increased interpolation-decay for smoother transitions */}
                    <model-viewer
                        ref={modelViewerRef}
                        src="/schwerelos.glb?v=11"
                        poster="/sequence/schwerelos/Design_ohne_Titel_200.jpg"
                        alt="Schwerelos Skulptur 3D"
                        bounds="tight"
                        shadow-intensity="4"
                        exposure="1.0"
                        tone-mapping="neutral"
                        camera-controls
                        auto-rotate={activeIndex === null}
                        rotation-per-second="15deg"
                        // DYNAMIC ORBIT: Only enforce orbit when active. When null (idle), remove prop to let auto-rotate flow naturally.
                        camera-orbit={activeIndex === null ? undefined : currentData.orbit}
                        camera-target={activeIndex === null ? "0m 1.5m 0m" : currentData.target}
                        field-of-view={currentData.fov}
                        min-camera-orbit="auto auto 5%"
                        min-field-of-view="2deg"
                        interaction-prompt="none"
                        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
                        interpolation-decay="200"
                    />
                </div>

                {/* 3. BOTTOM: DYNAMIC CONTENT & BUTTONS */}
                <div className="relative z-30 w-full p-6 md:p-12 pt-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent shrink-0">

                    {/* Dynamic Text */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex ?? "initial"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="w-full mb-8 max-w-2xl"
                        >
                            {/* Larger Dynamic Title */}
                            <h4 className="text-3xl md:text-4xl font-[family-name:var(--font-outfit)] font-black text-white mb-2 tracking-tight">
                                {currentData.title}
                            </h4>
                            <div className="text-base md:text-lg text-white/60 font-[family-name:var(--font-dm)] leading-relaxed">
                                {currentData.text}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Buttons (Left Aligned) */}
                    <div className="flex flex-wrap gap-2 md:gap-3 justify-start items-center">
                        {DATA.map((item, index) => (
                            <TabButton
                                key={index}
                                active={index === activeIndex}
                                onClick={() => setActiveIndex(index)}
                                label={item.title.split('. ')[1] || item.title} // Short label
                                index={index}
                            />
                        ))}
                        {activeIndex !== null && (
                            <button
                                onClick={() => setActiveIndex(null)}
                                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 h-12 px-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:bg-white/20 transition-all group z-40"
                                title="Reset View"
                            >
                                <div className="w-6 h-6 flex items-center justify-center rounded-full border border-white/50 text-white group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                </div>
                                <span className="text-xs uppercase tracking-widest font-bold font-[family-name:var(--font-outfit)]">Ansicht zurücksetzen</span>
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </section >
    );
}

// Drifting "Buoy" Button - Enhanced Design (Buttons look clickable)
function TabButton({ active, onClick, label, index }: { active: boolean, onClick: () => void, label: string, index: number }) {
    // Subtle float
    const duration = 5 + (index % 3);
    const yOffset = 3 + (index % 2) * 2;

    return (
        <motion.button
            onClick={onClick}
            animate={{
                y: [0, yOffset, 0]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.2
            }}
            className={`
                px-4 py-2 rounded-full border text-xs uppercase tracking-[0.15em] transition-all duration-300 relative cursor-pointer font-[family-name:var(--font-outfit)]
                ${active
                    ? "bg-white text-black border-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] ring-1 ring-blue-400"
                    : "bg-blue-900/10 border-blue-500/20 text-blue-200 hover:bg-blue-500/20 hover:text-white hover:border-blue-400/50 backdrop-blur-sm shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                }
            `}
        >
            {label}
        </motion.button>
    )
}

// Wave Text Animation (Helix Metaphor)
function WaveText({ text }: { text: string }) {
    const words = text.split(" ");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.04, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="font-[family-name:var(--font-dm)] text-lg md:text-xl font-medium text-white/90 leading-relaxed max-w-lg"
        >
            {words.map((word, index) => (
                <motion.span variants={child} key={index} className="inline-block mr-1.5 origin-bottom">
                    {word}
                </motion.span>
            ))}
        </motion.div>
    );
}
