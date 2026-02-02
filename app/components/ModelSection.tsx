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
        <section className="relative w-full min-h-screen md:h-screen bg-[#050505] flex flex-col items-center justify-center snap-section py-0 px-0 md:px-0">

            {/* FULL SCREEN IMMERSIVE CONTAINER */}
            <div className="relative w-full h-full md:h-screen w-screen bg-[#050505] overflow-hidden flex flex-col md:flex-row shadow-2xl">

                {/* 1. LEFT/TOP: TEXT (NOW OVERLAY OR SIDE) */}
                <div className="relative z-30 w-full md:w-1/3 p-8 md:p-16 flex flex-col justify-center order-2 md:order-1 bg-gradient-to-r from-black via-black/80 to-transparent pointer-events-none md:pointer-events-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex ?? "initial"}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="max-w-xl"
                        >
                            <span className="text-xs uppercase tracking-[0.4em] text-white/50 font-bold block mb-4">
                                {currentData.title}
                            </span>

                            <h3 className="text-5xl md:text-8xl font-[family-name:var(--font-outfit)] font-black text-white mb-8 tracking-tighter leading-[0.85]">
                                {activeIndex === null ? "SCHWERE\nLOS" : currentData.title.split('. ')[1] || currentData.title}
                            </h3>

                            <div className="flex md:block">
                                <WaveText text={currentData.text} />
                            </div>

                            {activeIndex !== null && (
                                <button
                                    onClick={() => setActiveIndex(null)}
                                    className="mt-8 px-6 py-3 border border-white/20 rounded-full text-xs text-white/60 uppercase tracking-widest hover:bg-white hover:text-black transition-all cursor-pointer font-bold pointer-events-auto"
                                >
                                    Zurück zur Übersicht
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 2. RIGHT/CENTER: MODEL VIEWER (HUGE) */}
                <div className="absolute inset-0 md:relative md:w-2/3 h-[60vh] md:h-full cursor-grab active:cursor-grabbing order-1 md:order-2 z-10 md:z-0">
                    <model-viewer
                        ref={modelViewerRef}
                        src="/schwerelos.glb?v=11"
                        poster="/sequence/schwerelos/Design_ohne_Titel_200.jpg"
                        alt="Schwerelos Skulptur 3D"
                        bounds="tight"
                        shadow-intensity="2"
                        exposure="1.5"
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
                    {/* Gradient Overlay for Text Readability on Mobile */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:hidden pointer-events-none" />
                </div>

                {/* 3. FLOATING TABS (BOTTOM RIGHT) */}
                <div className="absolute bottom-12 right-0 md:right-12 w-full md:w-auto p-6 md:p-0 z-40 flex justify-center md:justify-end">
                    <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-end max-w-lg">
                        {DATA.map((item, index) => (
                            <TabButton
                                key={index}
                                active={index === activeIndex}
                                onClick={() => setActiveIndex(index)}
                                label={`0${index + 1}`}
                                index={index}
                            />
                        ))}
                    </div>
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
