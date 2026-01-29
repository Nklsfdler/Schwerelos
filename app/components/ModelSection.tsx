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
        <section className="relative w-full h-screen bg-[#111] overflow-hidden flex flex-col md:flex-row items-center justify-center snap-section">

            {/* Background Texture/Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-[#111] to-black pointer-events-none" />

            {/* 3D VISUALIZER */}
            <div className="w-full h-[50vh] md:h-full md:w-3/5 relative order-2 md:order-1 cursor-grab active:cursor-grabbing z-10">
                <model-viewer
                    ref={modelViewerRef}
                    src="/schwerelos.glb?v=11"
                    poster="/sequence/schwerelos/Design_ohne_Titel_200.jpg"
                    alt="Schwerelos Skulptur 3D"
                    bounds="tight"
                    shadow-intensity="1.0"
                    exposure="1.0"
                    tone-mapping="aces"
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

            {/* INTERACTIVE TEXT / TABS */}
            <div className="w-full h-[50vh] md:h-full md:w-2/5 p-8 md:p-12 flex flex-col justify-center relative z-20 order-1 md:order-2 bg-gradient-to-b from-transparent to-black/40 md:to-transparent">

                {/* Floating Tabs Navigation */}
                <div className="flex flex-wrap gap-x-4 gap-y-4 mb-16">
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

                {/* Animated Description */}
                <div className="min-h-[200px] relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex ?? "initial"}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute top-0 left-0 w-full"
                        >
                            <span className="text-xs font-[family-name:var(--font-outfit)] uppercase tracking-[0.2em] text-white/70 font-bold mb-4 block">
                                Semantische Beschreibung
                            </span>
                            <h3 className="text-4xl md:text-6xl font-[family-name:var(--font-outfit)] font-black text-white mb-8 tracking-tight">
                                {currentData.title}
                            </h3>

                            {/* Standard Text */}
                            <WaveText text={currentData.text} />

                            {activeIndex !== null && (
                                <button
                                    onClick={() => setActiveIndex(null)}
                                    className="mt-8 px-6 py-2 border border-white/20 rounded-full text-xs text-white/60 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all cursor-pointer font-[family-name:var(--font-outfit)] font-bold"
                                >
                                    ← Zur Gesamtansicht
                                </button>
                            )}
                        </motion.div>
                    </AnimatePresence>
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
