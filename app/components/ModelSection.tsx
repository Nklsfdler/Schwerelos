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
        orbit: "200deg 50deg 75%",  // CLOSER
        target: "-0.1m 2.2m 0m",
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
    orbit: "45deg 75deg 150%",
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
        <section className="relative w-full min-h-screen md:h-screen bg-[#050505] flex flex-col items-center justify-center snap-section py-20 px-4 md:px-12">

            {/* SEPARATE CARD CONTAINER - LIGHTER STYLE */}
            <div className="relative w-full max-w-[1200px] h-auto md:h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">

                {/* Background Texture/Gradient - Lighter & More Transparent */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-800/10 via-[#0a0a0a] to-[#050505] pointer-events-none" />

                {/* 1. TOP: TEXT DESCRIPTION */}
                <div className="relative z-30 w-full p-8 md:p-12 text-center flex flex-col items-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex ?? "initial"}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-2xl"
                        >
                            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4 block">
                                Semantische Beschreibung
                            </span>
                            <h3 className="text-3xl md:text-5xl font-[family-name:var(--font-outfit)] font-black text-white mb-6 tracking-tight">
                                {currentData.title}
                            </h3>
                            <div className="flex justify-center">
                                <WaveText text={currentData.text} />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 2. MIDDLE: MODEL VIEWER (Expanded) */}
                <div className="relative z-10 w-full flex-grow min-h-[40vh] md:min-h-0 cursor-grab active:cursor-grabbing">
                    <div className="absolute top-4 left-6 z-50 pointer-events-none opacity-50">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 border border-white/10 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md">Interactive 3D</span>
                    </div>
                    <model-viewer
                        ref={modelViewerRef}
                        src="/schwerelos.glb?v=11"
                        poster="/sequence/schwerelos/Design_ohne_Titel_200.jpg"
                        alt="Schwerelos Skulptur 3D"
                        bounds="tight"
                        shadow-intensity="1.5"
                        exposure="1.2"
                        tone-mapping="neutral"
                        camera-controls
                        auto-rotate={activeIndex === null}
                        camera-orbit={currentData.orbit}
                        camera-target={currentData.target}
                        field-of-view={currentData.fov}
                        min-camera-orbit="auto auto 0%"
                        min-field-of-view="2deg"
                        interaction-prompt="none"
                        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
                        interpolation-decay="200"
                    />
                </div>

                {/* 3. BOTTOM: BUTTONS */}
                <div className="relative z-30 w-full p-8 md:p-12 border-t border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {DATA.map((item, index) => (
                            <TabButton
                                key={index}
                                active={index === activeIndex}
                                onClick={() => setActiveIndex(index)}
                                label={item.title}
                                index={index}
                            />
                        ))}
                    </div>

                    {activeIndex !== null && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => setActiveIndex(null)}
                                className="px-5 py-2 border border-white/10 rounded-full text-[10px] text-white/40 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-all cursor-pointer font-bold"
                            >
                                Reset View
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </section>
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
